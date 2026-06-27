import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = neon(databaseUrl);

function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

async function run() {
  console.log("Starting slug migration...");

  // 1. Add column if not exists
  console.log("Adding slug columns to tables...");
  try {
    await sql`ALTER TABLE "artworks" ADD COLUMN IF NOT EXISTS "slug" text;`;
    console.log("✓ Added slug column to artworks");
  } catch (err) {
    console.warn("Artworks slug column update warning:", err);
  }

  try {
    await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "slug" text;`;
    console.log("✓ Added slug column to projects");
  } catch (err) {
    console.warn("Projects slug column update warning:", err);
  }

  try {
    await sql`ALTER TABLE "animations" ADD COLUMN IF NOT EXISTS "slug" text;`;
    console.log("✓ Added slug column to animations");
  } catch (err) {
    console.warn("Animations slug column update warning:", err);
  }

  // 2. Backfill existing records with unique slugs
  console.log("\nBackfilling existing records...");

  // Artworks
  const artworksList = await sql`SELECT id, title, slug FROM "artworks"`;
  for (const artwork of artworksList) {
    if (!artwork.slug) {
      const base = slugify(artwork.title || 'artwork');
      const slug = `${base || 'artwork'}-${artwork.id}`;
      await sql`UPDATE "artworks" SET slug = ${slug} WHERE id = ${artwork.id}`;
      console.log(`Updated artwork ${artwork.id} slug: ${slug}`);
    }
  }

  // Projects
  const projectsList = await sql`SELECT id, title, slug FROM "projects"`;
  for (const project of projectsList) {
    if (!project.slug) {
      const base = slugify(project.title || 'project');
      const slug = `${base || 'project'}-${project.id}`;
      await sql`UPDATE "projects" SET slug = ${slug} WHERE id = ${project.id}`;
      console.log(`Updated project ${project.id} slug: ${slug}`);
    }
  }

  // Animations
  const animationsList = await sql`SELECT id, title, slug FROM "animations"`;
  for (const animation of animationsList) {
    if (!animation.slug) {
      const base = slugify(animation.title || 'animation');
      const slug = `${base || 'animation'}-${animation.id}`;
      await sql`UPDATE "animations" SET slug = ${slug} WHERE id = ${animation.id}`;
      console.log(`Updated animation ${animation.id} slug: ${slug}`);
    }
  }

  // 3. Add UNIQUE constraints
  console.log("\nAdding unique constraints to slug columns...");
  try {
    await sql`ALTER TABLE "artworks" ADD CONSTRAINT "artworks_slug_unique" UNIQUE("slug");`;
    console.log("✓ Added unique constraint to artworks slug");
  } catch (err: any) {
    if (err.code === '42710') {
      console.log("✓ artworks_slug_unique constraint already exists");
    } else {
      console.warn("Failed to add artworks unique constraint:", err);
    }
  }

  try {
    await sql`ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");`;
    console.log("✓ Added unique constraint to projects slug");
  } catch (err: any) {
    if (err.code === '42710') {
      console.log("✓ projects_slug_unique constraint already exists");
    } else {
      console.warn("Failed to add projects unique constraint:", err);
    }
  }

  try {
    await sql`ALTER TABLE "animations" ADD CONSTRAINT "animations_slug_unique" UNIQUE("slug");`;
    console.log("✓ Added unique constraint to animations slug");
  } catch (err: any) {
    if (err.code === '42710') {
      console.log("✓ animations_slug_unique constraint already exists");
    } else {
      console.warn("Failed to add animations unique constraint:", err);
    }
  }

  console.log("\nSlug migration completed successfully!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
