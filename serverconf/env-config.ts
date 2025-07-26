import * as path from "path";
import * as fs from "fs";
import ConsoleApi from "../modules/console-api";

interface EnvironmentConfig {
	// Server configuration
	PORT: number;
	NODE_ENV: string;
	SERVER_URL: string;

	// Database configuration
	DB_HOST?: string;
	DB_PORT?: number;
	DB_USER?: string;
	DB_PASSWORD?: string;
	DB_NAME?: string;
	DB_CONNECTION_LIMIT?: number;

	// Redis configuration
	REDIS_ENABLED: boolean;
	REDIS_HOST: string;
	REDIS_PORT: number;
	REDIS_PASSWORD?: string;
	REDIS_DATABASE: number;
	REDIS_NAMESPACE?: string;

	// Security
	GJP_SECRET: string;
	XOR_KEY: string;
	CAPTCHA_SECRET?: string;

	// External services
	YOUTUBE_API_KEY?: string;
	AWS_ACCESS_KEY_ID?: string;
	AWS_SECRET_ACCESS_KEY?: string;
	AWS_REGION?: string;
	AWS_S3_BUCKET?: string;

	// GDPS specific
	GDPS_NAME: string;
	GDPS_ID: string;
	ADMIN_EMAIL: string;
	DEFAULT_ADMIN_USERNAME: string;
	DEFAULT_ADMIN_PASSWORD: string;

	// Features
	ENABLE_REGISTRATION: boolean;
	ENABLE_LEVEL_UPLOADS: boolean;
	ENABLE_COMMENTS: boolean;
	ENABLE_MUSIC_UPLOADS: boolean;

	// Logging
	LOG_LEVEL: string;
	LOG_TO_FILE: boolean;

	// Performance
	MAX_UPLOAD_SIZE: string;
	REQUEST_TIMEOUT: number;
	RATE_LIMIT_WINDOW: number;
	RATE_LIMIT_MAX_REQUESTS: number;
}

class EnvironmentConfigManager {
	private config: EnvironmentConfig;

	constructor() {
		this.config = this.loadEnvironmentConfig();
		this.validateConfig();
	}

	private loadEnvironmentConfig(): EnvironmentConfig {
		// Load .env file if it exists
		this.loadDotEnvFile();

		const config: EnvironmentConfig = {
			// Server configuration
			PORT: this.getEnvAsNumber("PORT", 3010),
			NODE_ENV: this.getEnvAsString("NODE_ENV", "development"),
			SERVER_URL: this.getEnvAsString("SERVER_URL", "http://localhost:3010"),

			// Database configuration (deprecated)
			DB_HOST: this.getEnvAsString("DB_HOST", "localhost"),
			DB_PORT: this.getEnvAsNumber("DB_PORT", 3306),
			DB_USER: this.getEnvAsString("DB_USER", "gdps"),
			DB_PASSWORD: this.getEnvAsString("DB_PASSWORD", ""),
			DB_NAME: this.getEnvAsString("DB_NAME", "gdps"),
			DB_CONNECTION_LIMIT: this.getEnvAsNumber("DB_CONNECTION_LIMIT", 10),

			// Redis configuration
			REDIS_ENABLED: this.getEnvAsBoolean("REDIS_ENABLED", false),
			REDIS_HOST: this.getEnvAsString("REDIS_HOST", "localhost"),
			REDIS_PORT: this.getEnvAsNumber("REDIS_PORT", 6379),
			REDIS_PASSWORD: this.getEnvAsString("REDIS_PASSWORD"),
			REDIS_DATABASE: this.getEnvAsNumber("REDIS_DATABASE", 0),
			REDIS_NAMESPACE: this.getEnvAsString("REDIS_NAMESPACE", "foreverhost"),

			// Security
			GJP_SECRET: this.getEnvAsString("GJP_SECRET", this.generateRandomSecret()),
			XOR_KEY: this.getEnvAsString("XOR_KEY", this.generateRandomSecret()),
			CAPTCHA_SECRET: this.getEnvAsString("CAPTCHA_SECRET"),

			// External services
			YOUTUBE_API_KEY: this.getEnvAsString("YOUTUBE_API_KEY"),
			AWS_ACCESS_KEY_ID: this.getEnvAsString("AWS_ACCESS_KEY_ID"),
			AWS_SECRET_ACCESS_KEY: this.getEnvAsString("AWS_SECRET_ACCESS_KEY"),
			AWS_REGION: this.getEnvAsString("AWS_REGION", "us-east-1"),
			AWS_S3_BUCKET: this.getEnvAsString("AWS_S3_BUCKET"),

			// GDPS specific
			GDPS_NAME: this.getEnvAsString("GDPS_NAME", "ForeverCore GDPS"),
			GDPS_ID: this.getEnvAsString("GDPS_ID", "main"),
			ADMIN_EMAIL: this.getEnvAsString("ADMIN_EMAIL", "admin@gdps.local"),
			DEFAULT_ADMIN_USERNAME: this.getEnvAsString("DEFAULT_ADMIN_USERNAME", "admin"),
			DEFAULT_ADMIN_PASSWORD: this.getEnvAsString("DEFAULT_ADMIN_PASSWORD", "admin123"),

			// Features
			ENABLE_REGISTRATION: this.getEnvAsBoolean("ENABLE_REGISTRATION", true),
			ENABLE_LEVEL_UPLOADS: this.getEnvAsBoolean("ENABLE_LEVEL_UPLOADS", true),
			ENABLE_COMMENTS: this.getEnvAsBoolean("ENABLE_COMMENTS", true),
			ENABLE_MUSIC_UPLOADS: this.getEnvAsBoolean("ENABLE_MUSIC_UPLOADS", true),

			// Logging
			LOG_LEVEL: this.getEnvAsString("LOG_LEVEL", "info"),
			LOG_TO_FILE: this.getEnvAsBoolean("LOG_TO_FILE", true),

			// Performance
			MAX_UPLOAD_SIZE: this.getEnvAsString("MAX_UPLOAD_SIZE", "50mb"),
			REQUEST_TIMEOUT: this.getEnvAsNumber("REQUEST_TIMEOUT", 30000),
			RATE_LIMIT_WINDOW: this.getEnvAsNumber("RATE_LIMIT_WINDOW", 900000), // 15 minutes
			RATE_LIMIT_MAX_REQUESTS: this.getEnvAsNumber("RATE_LIMIT_MAX_REQUESTS", 100)
		};

		return config;
	}

	private loadDotEnvFile(): void {
		const envPath = path.join(__dirname, "../.env");
		if (fs.existsSync(envPath)) {
			try {
				const envContent = fs.readFileSync(envPath, "utf8");
				const lines = envContent.split("\n");

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (trimmedLine && !trimmedLine.startsWith("#")) {
						const [key, ...valueParts] = trimmedLine.split("=");
						if (key && valueParts.length > 0) {
							const value = valueParts.join("=").replace(/^["']|["']$/g, "");
							process.env[key.trim()] = value;
						}
					}
				}

				ConsoleApi.Log("EnvConfig", "Loaded .env file successfully");
			} catch (error) {
				ConsoleApi.Warn("EnvConfig", `Failed to load .env file: ${error}`);
			}
		}
	}

	private getEnvAsString(key: string, defaultValue?: string): string {
		const value = process.env[key];
		if (value === undefined) {
			if (defaultValue === undefined) {
				throw new Error(`Required environment variable ${key} is not set`);
			}
			return defaultValue;
		}
		return value;
	}

	private getEnvAsNumber(key: string, defaultValue?: number): number {
		const value = process.env[key];
		if (value === undefined) {
			if (defaultValue === undefined) {
				throw new Error(`Required environment variable ${key} is not set`);
			}
			return defaultValue;
		}

		const parsed = parseInt(value, 10);
		if (isNaN(parsed)) {
			throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
		}
		return parsed;
	}

	private getEnvAsBoolean(key: string, defaultValue?: boolean): boolean {
		const value = process.env[key];
		if (value === undefined) {
			if (defaultValue === undefined) {
				throw new Error(`Required environment variable ${key} is not set`);
			}
			return defaultValue;
		}

		return value.toLowerCase() === "true" || value === "1";
	}

	private generateRandomSecret(): string {
		const crypto = require("crypto");
		return crypto.randomBytes(32).toString("hex");
	}

	private validateConfig(): void {
		// Validate critical configurations
		if (!this.config.DB_PASSWORD && this.config.NODE_ENV === "production") {
			ConsoleApi.Warn("EnvConfig", "Database password is not set in production environment");
		}

		if (this.config.GJP_SECRET.length < 16) {
			ConsoleApi.Warn("EnvConfig", "GJP secret should be at least 16 characters long");
		}

		if (this.config.REDIS_ENABLED && !this.config.REDIS_HOST) {
			throw new Error("Redis is enabled but REDIS_HOST is not configured");
		}

		ConsoleApi.Log("EnvConfig", "Environment configuration validated successfully");
	}

	public getConfig(): EnvironmentConfig {
		return { ...this.config };
	}

	public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
		return this.config[key];
	}

	public isDevelopment(): boolean {
		return this.config.NODE_ENV === "development";
	}

	public isProduction(): boolean {
		return this.config.NODE_ENV === "production";
	}

	public isTest(): boolean {
		return this.config.NODE_ENV === "test";
	}

	public logConfiguration(): void {
		if (this.isDevelopment()) {
			const safeConfig = { ...this.config };
			// Hide sensitive information
			safeConfig.DB_PASSWORD = "***";
			safeConfig.GJP_SECRET = "***";
			safeConfig.XOR_KEY = "***";
			safeConfig.REDIS_PASSWORD = safeConfig.REDIS_PASSWORD ? "***" : undefined;

			ConsoleApi.Log("EnvConfig", "Current configuration:");
			console.table(safeConfig);
		}
	}
}

// Singleton instance
const envConfigManager = new EnvironmentConfigManager();

export { EnvironmentConfig };
export default envConfigManager;
