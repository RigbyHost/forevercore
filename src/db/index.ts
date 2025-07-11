// Re-export everything from connections for backward compatibility
export { hostingDb, getGdpsDb, createGdpsDatabase, deleteGdpsDatabase } from './connections.js';
export * as schema from './schema.js';
export * as hostingSchema from './hosting-schema.js';