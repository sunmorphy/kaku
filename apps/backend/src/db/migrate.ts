import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './connection';

config();

async function main() {
  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './drizzle', migrationsSchema: 'drizzle' });

  console.log('Migrations completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});