'package net.fimastgd.forevercore.tslib.TS_handler';

import { Connection } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import ConsoleApi from '../modules/console-api';
import db from '../serverconf/db';

/**
 * Initializes TypeScript components and performs validation
 * @returns Promise that resolves when initialization is complete
 */
async function TS_handler(): Promise<void> {
	try {
		// Ensure directories exist
		const directories = [
			path.join(__dirname, '..', 'logs'),
			path.join(__dirname, '..', 'data', 'levels'),
			path.join(__dirname, '..', 'data', 'accounts'),
			path.join(__dirname, '..', 'data', 'accounts', 'keys'),
			path.join(__dirname, '..', 'data', 'levels', 'deleted')
		];

		for (const dir of directories) {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
				ConsoleApi.Log('TS_handler', `Created directory: ${dir}`);
			}
		}

		// Validate database connection
		await validateDatabaseConnection();

		// Check that routes are properly set up
		validateRoutes();

		ConsoleApi.Log('TS_handler', 'TypeScript initialization complete');
	} catch (error) {
		ConsoleApi.Error('TS_handler', `Error during initialization: ${error}`);
	}

	return;
}

/**
 * Validates database connection and required tables
 */
async function validateDatabaseConnection(): Promise<void> {
	try {
		// Check connection
		await db.execute('SELECT 1');
		ConsoleApi.Log('TS_handler', 'Database connection successful');

		// Check essential tables
		const requiredTables = [
			'accounts', 'users', 'levels', 'comments',
			'friendships', 'blocks', 'modactions', 'roles',
			'dailyfeatures', 'songs'
		];

		const [rows] = await db.execute<any>('SHOW TABLES');
		const existingTables = rows.map((row: any) => Object.values(row)[0].toString().toLowerCase());

		const missingTables = requiredTables.filter(table => !existingTables.includes(table));

		if (missingTables.length > 0) {
			ConsoleApi.Warn('TS_handler', `Missing required tables: ${missingTables.join(', ')}`);
		} else {
			ConsoleApi.Log('TS_handler', 'All required database tables exist');
		}
	} catch (error) {
		ConsoleApi.Error('TS_handler', `Database validation failed: ${error}`);
		throw error;
	}
}

/**
 * Validates routes and API endpoints
 */
function validateRoutes(): void {
	const apiDirectory = path.join(__dirname, '..', 'api');
	const routesDirectory = path.join(__dirname, '..', 'routes');

	// Check if essential API directories exist
	const requiredApiDirs = [
		'accounts', 'comments', 'friendships', 'levels',
		'lib', 'packs', 'communication', 'mods', 'other',
		'rewards', 'scores', 'system'
	];

	const missingApiDirs = requiredApiDirs.filter(dir => !fs.existsSync(path.join(apiDirectory, dir)));

	if (missingApiDirs.length > 0) {
		ConsoleApi.Warn('TS_handler', `Missing API directories: ${missingApiDirs.join(', ')}`);
	}

	// Check if essential route directories exist
	const requiredRouteDirs = [
		'panel', 'cmd'
	];

	const missingRouteDirs = requiredRouteDirs.filter(dir => !fs.existsSync(path.join(routesDirectory, dir)));

	if (missingRouteDirs.length > 0) {
		ConsoleApi.Warn('TS_handler', `Missing route directories: ${missingRouteDirs.join(', ')}`);
	}

	ConsoleApi.Log('TS_handler', 'Routes validation complete');
}

export default TS_handler;