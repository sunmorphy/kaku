import { query } from './connection';
import fs from 'fs';
import path from 'path';

async function migrateUserRole() {
  try {
    console.log('Starting user role migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-user-role.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await query(sql);
    
    console.log('User role migration completed successfully!');
  } catch (error) {
    console.error('Error during user role migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUserRole()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateUserRole };