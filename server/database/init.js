import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  console.log('🔄 Initializing MySQL Database for CareerSync...');
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'careersync_db';

  try {
    const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    
    console.log('✅ Connected to MySQL Server');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('✅ Database Schema created/updated successfully');

    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);
    console.log('✅ Seed Data inserted successfully');

    await connection.end();
    console.log('🎉 Database initialization complete!');
  } catch (error) {
    console.warn('⚠️ Could not connect to MySQL server with provided credentials:', error.message);
    console.warn('ℹ️ CareerSync will automatically fall back to memory store mode for seamless offline testing.');
  }
}

initDB();
