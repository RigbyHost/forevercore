import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import envConfig from "./env-config";

interface DatabaseConfig {
	host: string;
	user: string;
	password: string;
	database: string;
	port?: number;
}

function createDBThread(id: string): DatabaseConfig {
	/* для мульти-подключений БД значения достаём из yaml конфигурации
	 * Оставил на всякий случай
	// Priority: Environment variables > YAML config > defaults

	// Try to get from environment first (recommended for production)
	const envHost = envConfig.get("DB_HOST");
	const envUser = envConfig.get("DB_USER");
	const envPassword = envConfig.get("DB_PASSWORD");
	const envDatabase = envConfig.get("DB_NAME");
	const envPort = envConfig.get("DB_PORT");

	if (envHost && envUser && envDatabase) {
		// For multi-GDPS setup: use GDPS ID as database suffix
		// If DB_NAME is "gdps" and ID is "main", use "gdps_main"
		// If DB_NAME is "gdps" and ID is "0001", use "gdps_0001"
		const databaseName = id === "main" ? envDatabase : `${envDatabase}_${id}`;

		return {
			host: envHost,
			user: envUser,
			password: envPassword,
			database: databaseName,
			port: envPort
		};
	}
	*/

	// Fallback to YAML config for backward compatibility
	const configPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/db.yml`);
	if (fs.existsSync(configPath)) {
		const fileContents = fs.readFileSync(configPath, "utf8");
		const config = yaml.load(fileContents) as DatabaseConfig;

		if (config.host && config.user && config.database) {
			return {
				host: config.host,
				user: config.user,
				password: config.password,
				database: config.database,
				port: config.port
			};
		}
	}

	/* Last resort: use environment variables with defaults
	return {
		host: envHost,
		user: envUser,
		password: envPassword,
		database: envDatabase,
		port: envPort
	}; */
}

export default createDBThread;
