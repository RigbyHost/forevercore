import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';
import * as hostingSchema from './hosting-schema.js';

// Connection pool for hosting database
const hostingConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'gdps',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forevercore_hosting',
  connectionLimit: 10,
});

export const hostingDb = drizzle(hostingConnection, { schema: hostingSchema, mode: 'default' });

// Cache for GDPS database connections
const gdpsConnections = new Map<string, ReturnType<typeof drizzle>>();

/**
 * Get database connection for specific GDPS
 */
export function getGdpsDb(gdpsId: string) {
  if (gdpsConnections.has(gdpsId)) {
    return gdpsConnections.get(gdpsId)!;
  }
  
  // Create new connection for this GDPS
  const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'gdps',
    password: process.env.DB_PASSWORD || '',
    database: `gdps_${gdpsId}`,
    connectionLimit: 5,
  });
  
  const db = drizzle(connection, { schema, mode: 'default' });
  gdpsConnections.set(gdpsId, db);
  
  return db;
}

/**
 * Create database for new GDPS
 */
export async function createGdpsDatabase(gdpsId: string) {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'gdps',
    password: process.env.DB_PASSWORD || '',
  });
  
  try {
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS gdps_${gdpsId}`);
    
    // Run migrations on new database
    // TODO: Implement migration runner for new GDPS databases
    
    return true;
  } catch (error) {
    console.error(`Failed to create database for GDPS ${gdpsId}:`, error);
    return false;
  } finally {
    await connection.end();
  }
}

/**
 * Delete database for GDPS
 */
export async function deleteGdpsDatabase(gdpsId: string) {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'gdps',
    password: process.env.DB_PASSWORD || '',
  });
  
  try {
    // Remove from cache
    if (gdpsConnections.has(gdpsId)) {
      gdpsConnections.delete(gdpsId);
    }
    
    // Drop database
    await connection.execute(`DROP DATABASE IF EXISTS gdps_${gdpsId}`);
    
    return true;
  } catch (error) {
    console.error(`Failed to delete database for GDPS ${gdpsId}:`, error);
    return false;
  } finally {
    await connection.end();
  }
}