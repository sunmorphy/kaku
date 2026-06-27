import { pgTable, serial, varchar, text, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  summary: text('summary'),
  socials: text('socials').array(),
  profile_image_path: text('profile_image_path'),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  pseudonym: text('pseudonym'),
  banner_image_path: text('banner_image_path'),
  short_summary: text('short_summary'),
  role: text('role').default('Artist'),
});

// Categories Table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Artworks Table
export const artworks = pgTable('artworks', {
  id: serial('id').primaryKey(),
  image_path: text('image_path').notNull(),
  title: text('title'),
  description: text('description'),
  type: text('type').default('portfolio').notNull(),
  published: boolean('published').default(true).notNull(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').unique(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Projects Table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  batch_image_path: text('batch_image_path').array().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').default('portfolio').notNull(),
  published: boolean('published').default(true).notNull(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').unique(),
  cover_image_path: text('cover_image_path'),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Animations Table
export const animations = pgTable('animations', {
  id: serial('id').primaryKey(),
  batch_video_path: text('batch_video_path').array().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  published: boolean('published').default(true).notNull(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').unique(),
  cover_image_path: text('cover_image_path'),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Junction Tables for Many-to-Many Categories

// Artwork Categories Junction Table
export const artworkCategories = pgTable('artwork_categories', {
  artwork_id: integer('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.artwork_id, t.category_id] })
]);

// Project Categories Junction Table
export const projectCategories = pgTable('project_categories', {
  project_id: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.project_id, t.category_id] })
]);

// Animation Categories Junction Table
export const animationCategories = pgTable('animation_categories', {
  animation_id: integer('animation_id').notNull().references(() => animations.id, { onDelete: 'cascade' }),
  category_id: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.animation_id, t.category_id] })
]);

// Contact Messages Table
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 200 }),
  message: text('message').notNull(),
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  artworks: many(artworks),
  projects: many(projects),
  animations: many(animations),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.user_id],
    references: [users.id],
  }),
  artworkCategories: many(artworkCategories),
  projectCategories: many(projectCategories),
  animationCategories: many(animationCategories),
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  user: one(users, {
    fields: [artworks.user_id],
    references: [users.id],
  }),
  artworkCategories: many(artworkCategories),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.user_id],
    references: [users.id],
  }),
  projectCategories: many(projectCategories),
}));

export const animationsRelations = relations(animations, ({ one, many }) => ({
  user: one(users, {
    fields: [animations.user_id],
    references: [users.id],
  }),
  animationCategories: many(animationCategories),
}));

export const artworkCategoriesRelations = relations(artworkCategories, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkCategories.artwork_id],
    references: [artworks.id],
  }),
  category: one(categories, {
    fields: [artworkCategories.category_id],
    references: [categories.id],
  }),
}));

export const projectCategoriesRelations = relations(projectCategories, ({ one }) => ({
  project: one(projects, {
    fields: [projectCategories.project_id],
    references: [projects.id],
  }),
  category: one(categories, {
    fields: [projectCategories.category_id],
    references: [categories.id],
  }),
}));

export const animationCategoriesRelations = relations(animationCategories, ({ one }) => ({
  animation: one(animations, {
    fields: [animationCategories.animation_id],
    references: [animations.id],
  }),
  category: one(categories, {
    fields: [animationCategories.category_id],
    references: [categories.id],
  }),
}));