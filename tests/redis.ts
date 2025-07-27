import RedisController from "@RedisController";
import envConfig from "@/serverconf/env-config";

(async () => {
	const redis = new RedisController({
		host: envConfig.get("REDIS_HOST"),
		port: envConfig.get("REDIS_PORT"),
		keyPrefix: envConfig.get("REDIS_NAMESPACE"),
		password: envConfig.get("REDIS_PASSWORD")
	});

	// Сохранение конфигурации
	 await redis.setConfig("3002", "settings", {
		serverName: "GDPS",
		sessionGrants: false,
		unregisteredSubmissions: false,
		topCount: 100,
		objectLimitFU: true,
		objectLimitCount: 100,
		diffVote: true,
		diffVoteLevel: 3,
		hardDiffVote: false
	});

	// Получение конфигурации
	let config = await redis.getConfig("3002", "settings");
	console.log(config);
	await redis.updateConfig("3002", "settings", {
		topCount: 42
	});
	config = await redis.getConfig("3002", "settings");
	console.log(config.topCount);
	console.log(await redis.getAllConfigs("3002"));
})();
