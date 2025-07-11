import { defineConfig } from 'drizzle-kit';

// This config is for main hosting database
// Individual GDPS databases are created dynamically as gdps_[id]
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'gdps',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'forevercore_hosting', // main hosting DB
  },
});