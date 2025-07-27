`package net.fimastgd.forevercore.serverconf.settings`;

import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";
import RedisController from "@RedisController";
import envConfig from "@/serverconf/env-config";

/** Priority: YAML < Redis */

interface ServerSettings {
	serverName: string;
	topCount: number;
	objectLimitFU: boolean;
	objectLimitCount: number;
	diffVote: boolean;
	diffVoteLevel: number;
	hardDiffVote: boolean;
	sessionGrants: boolean;
	unregisteredSubmissions: boolean;
}
type RedisData = ServerSettings | {} | null;

function loadServerSettings(id: string): ServerSettings {
	const defaultSettings: ServerSettings = {
		serverName: "GDPS",
		sessionGrants: false,
		unregisteredSubmissions: false,
		topCount: 100,
		objectLimitFU: true,
		objectLimitCount: 100,
		diffVote: true,
		diffVoteLevel: 3,
		hardDiffVote: false
	};

	try {
		if (envConfig.get("REDIS_ENABLED")) {
			const redis = new RedisController({
				host: envConfig.get("REDIS_HOST"),
				port: envConfig.get("REDIS_PORT"),
				keyPrefix: envConfig.get("REDIS_NAMESPACE"),
				password: envConfig.get("REDIS_PASSWORD")
			});
			let data: RedisData = {};
			redis
				.getConfig(id, "settings")
				.then(val => {
					data = val;
					if (!data) {
						ConsoleApi.Warn(
							"Config",
							`Failed to get settings from redis for '${id}', trying to get settings from .yml... at net.fimastgd.forevercore.serverconf.settings`
						);
						const yamlPath = path.join(__root, `/GDPS_DATA/${id}/data/config/settings.yml`);
						const fileContents = fs.readFileSync(yamlPath, "utf8");
						return yaml.load(fileContents) as ServerSettings;
					} else {
						return data as ServerSettings;
					}
				})
				.catch(error => {
					ConsoleApi.Error("RedisController", e + " at net.fimastgd.forevercore.serverconf.settings");
				});
		} else {
			const yamlPath = path.join(__root, `/GDPS_DATA/${id}/data/config/settings.yml`);
			const fileContents = fs.readFileSync(yamlPath, "utf8");
			return yaml.load(fileContents) as ServerSettings;
		}
	} catch (error) {
		ConsoleApi.Error("Config", `Failed to load config settings.yml for '${id}', using default params...`);
		return defaultSettings;
	}
}

export function getSettings(id: string): ServerSettings {
	return loadServerSettings(id);
}
