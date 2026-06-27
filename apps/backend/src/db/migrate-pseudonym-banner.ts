import { query } from './connection';
import fs from 'fs';
import path from 'path';

async function migratePseudonymBanner() {
  try {
    console.log('Starting pseudonym and banner migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-pseudonym-banner.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await query(sql);
    
    console.log('Pseudonym and banner migration completed successfully!');
  } catch (error) {
    console.error('Error during pseudonym and banner migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migratePseudonymBanner()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migratePseudonymBanner };