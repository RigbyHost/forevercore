`package net.fimastgd.forevercore.serverconf.chests`;

import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import ConsoleApi from "@console-api";
import RedisController from "@RedisController";
import envConfig from "@/serverconf/env-config";
import __root from "@/__root";

interface ChestConfig {
	minOrbs: number;
	maxOrbs: number;
	minDiamonds: number;
	maxDiamonds: number;
	items: number[];
	minKeys: number;
	maxKeys: number;
	wait: number;
}

interface ChestsYamlConfig {
	smallChest: ChestConfig;
	bigChest: ChestConfig;
}

/** Priority: Redis < YAML */
async function loadChestConfig(id: string): Promise<ChestsYamlConfig> {
	const defaultConfig: ChestsYamlConfig = {
		smallChest: {
			minOrbs: 0,
			maxOrbs: 0,
			minDiamonds: 0,
			maxDiamonds: 0,
			items: [],
			minKeys: 0,
			maxKeys: 0,
			wait: 0
		},
		bigChest: {
			minOrbs: 0,
			maxOrbs: 0,
			minDiamonds: 0,
			maxDiamonds: 0,
			items: [],
			minKeys: 0,
			maxKeys: 0,
			wait: 0
		}
	};

	try {
		if (envConfig.get("REDIS_ENABLED")) {
			const redis = new RedisController({
				host: envConfig.get("REDIS_HOST"),
				port: envConfig.get("REDIS_PORT"),
				keyPrefix: envConfig.get("REDIS_NAMESPACE"),
				password: envConfig.get("REDIS_PASSWORD")
			});
			// ConsoleApi.Debug("ChestsConfig", "Redis initialized");

			try {
				const val = await redis.getConfig(id, "chests");
				if (val) {
					// ConsoleApi.Debug("ChestsConfig", "Config loaded from Redis. Data: " + JSON.stringify(val, null, 0));
					return val as ChestsYamlConfig;
				} else {
					ConsoleApi.Warn("ChestsConfig", `Failed to get chests config from redis for '${id}', falling back to .yml...`);
					return loadFromYaml(id);
				}
			} catch (redisError) {
				ConsoleApi.Error("RedisController", redisError + " at net.fimastgd.forevercore.serverconf.chests");
				return loadFromYaml(id);
			}
		} else {
			// ConsoleApi.Debug("ChestsConfig", "Redis is disabled");
			return loadFromYaml(id);
		}
	} catch (error) {
		ConsoleApi.Error("ChestsConfig", `Failed to load chests config for '${id}', using default: ${error}`);
		return defaultConfig;
	}
}

function loadFromYaml(id: string): ChestsYamlConfig {
	try {
		const yamlPath = path.join(__root, `/GDPS_DATA/${id}/data/config/chests.yml`);
		const fileContents = fs.readFileSync(yamlPath, "utf8");
		return yaml.load(fileContents) as ChestsYamlConfig;
	} catch (yamlError) {
		ConsoleApi.Error("ChestsConfig", `YAML load failed for '${id}': ${yamlError}`);
		throw yamlError;
	}
}

/** Getting configuration for small chests from containers */
export async function getSmallChest(id: string): Promise<ChestConfig> {
	const config = await loadChestConfig(id);
	return config.smallChest;
}

/** Getting configuration for big chests from containers */
export async function getBigChest(id: string): Promise<ChestConfig> {
	const config = await loadChestConfig(id);
	return config.bigChest;
}
