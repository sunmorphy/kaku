import { query } from './connection';
import fs from 'fs';
import path from 'path';

async function migrateShortSummary() {
  try {
    console.log('Starting short summary migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-short-summary.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await query(sql);
    
    console.log('Short summary migration completed successfully!');
  } catch (error) {
    console.error('Error during short summary migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateShortSummary()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateShortSummary };