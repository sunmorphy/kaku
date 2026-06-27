import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function migrateAnimationsTable() {
    const client = await pool.connect();
    try {
        const sql = readFileSync(join(__dirname, 'create-animations-table.sql'), 'utf-8');
        await client.query(sql);
        console.log('Animations table migration completed successfully');
    } catch (error) {
        console.error('Animations table migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrateAnimationsTable();
