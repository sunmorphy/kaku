import { query } from './connection';
import fs from 'fs';
import path from 'path';

async function migrateContactTable() {
  try {
    console.log('Starting contact table migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-contact-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await query(sql);
    
    console.log('Contact table migration completed successfully!');
  } catch (error) {
    console.error('Error during contact table migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateContactTable()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateContactTable };