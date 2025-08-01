`package net.fimastgd.forevercore.serverconf.music`;

import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import ConsoleApi from "@console-api";
import RedisController from "@RedisController";
import envConfig from "@/serverconf/env-config";
import __root from "@/__root";

interface MusicConfig {
	zemu: boolean;
}

/** Priority: Redis < YAML */
async function loadMusicConfig(id: string): Promise<MusicConfig> {
	const defaultConfig: MusicConfig = {
		zemu: false
	};

	try {
		if (envConfig.get("REDIS_ENABLED")) {
			const redis = new RedisController({
				host: envConfig.get("REDIS_HOST"),
				port: envConfig.get("REDIS_PORT"),
				keyPrefix: envConfig.get("REDIS_NAMESPACE"),
				password: envConfig.get("REDIS_PASSWORD")
			});
			// ConsoleApi.Debug("MusicConfig", "Redis initialized");

			try {
				const val = await redis.getConfig(id, "music");
				if (val) {
					// ConsoleApi.Debug("MusicConfig", "Config loaded from Redis. Data: " + JSON.stringify(val, null, 0));
					return val as MusicConfig;
				} else {
					ConsoleApi.Warn("MusicConfig", `No music config in Redis for '${id}', falling back to YAML`);
					return loadFromYaml(id);
				}
			} catch (redisError) {
				ConsoleApi.Error("RedisController", redisError + " at net.fimastgd.forevercore.serverconf.music");
				return loadFromYaml(id);
			}
		} else {
			// ConsoleApi.Debug("MusicConfig", "Redis is disabled");
			return loadFromYaml(id);
		}
	} catch (error) {
		ConsoleApi.Error("MusicConfig", `Failed to load music config for '${id}', using default: ${error}`);
		return defaultConfig;
	}
}

function loadFromYaml(id: string): MusicConfig {
	try {
		const yamlPath = path.join(__root, `/GDPS_DATA/${id}/data/config/music.yml`);
		const fileContents = fs.readFileSync(yamlPath, "utf8");
		return yaml.load(fileContents) as MusicConfig;
	} catch (yamlError) {
		ConsoleApi.Error("MusicConfig", `YAML load failed for '${id}': ${yamlError}`);
		return { zemu: false };
	}
}

/**
 * Получает конфигурацию музыки для указанного сервера
 * @param id Идентификатор сервера/контейнера
 * @returns Конфигурация музыки
 */
export async function getMusicState(id: string): Promise<MusicConfig> {
	return await loadMusicConfig(id);
}