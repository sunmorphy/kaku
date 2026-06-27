import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function migratePublishedField() {
    const client = await pool.connect();
    try {
        const sql = readFileSync(join(__dirname, 'add-published-field.sql'), 'utf-8');
        await client.query(sql);
        console.log('Published field migration completed successfully');
    } catch (error) {
        console.error('Published field migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migratePublishedField();
