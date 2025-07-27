import Redis from "ioredis";

export interface ConfigData {
	[key: string]: any;
}

export interface RedisConfigOptions {
	host?: string;
	port?: number;
	password?: string;
	db?: number;
	keyPrefix?: string;
}

export default class RedisController {
	private redis: Redis;
	private keyPrefix: string;

	constructor(options: RedisConfigOptions = {}) {
		this.redis = new Redis({
			host: options.host || "localhost",
			port: options.port || 6379,
			password: options.password,
			db: options.db || 0
		});

		this.keyPrefix = options.keyPrefix || "foreverhost";
	}

	/**
	 * создаёт ключ в формате /[gdpsid]/[configname]/[field]
	 */
	private createKey(gdpsid: string, configName: string, field?: string): string {
		const baseKey = `${this.keyPrefix}:${gdpsid}:${configName}`;
		return field ? `${baseKey}:${field}` : baseKey;
	}

	/**
	 * сохраняет JSON конфигурацию
	 */
	public async setConfig(gdpsid: string, configName: string, configData: ConfigData): Promise<void> {
		const key = this.createKey(gdpsid, configName);
		await this.redis.set(key, JSON.stringify(configData));
	}

	/**
	 * получает JSON конфигурацию
	 */
	public async getConfig(gdpsid: string, configName: string): Promise<ConfigData | null> {
		const key = this.createKey(gdpsid, configName);
		const data = await this.redis.get(key);
		return data ? JSON.parse(data) : null;
	}

	/**
	 * сохраняет отдельное поле конфигурации
	 */
	public async setConfigField(gdpsid: string, configName: string, field: string, value: any): Promise<void> {
		const key = this.createKey(gdpsid, configName, field);
		await this.redis.set(key, JSON.stringify(value));
	}

	/**
	 * получает отдельное поле конфигурации
	 */
	public async getConfigField(gdpsid: string, configName: string, field: string): Promise<any> {
		const key = this.createKey(gdpsid, configName, field);
		const data = await this.redis.get(key);
		return data ? JSON.parse(data) : null;
	}

	/**
	 * обновляет часть конфигурации (мерж с существующими данными)
	 */
	public async updateConfig(gdpsid: string, configName: string, updateData: Partial<ConfigData>): Promise<void> {
		const existingConfig = (await this.getConfig(gdpsid, configName)) || {};
		const mergedConfig = { ...existingConfig, ...updateData };
		await this.setConfig(gdpsid, configName, mergedConfig);
	}

	/**
	 * удаляет конфигурацию
	 */
	public async deleteConfig(gdpsid: string, configName: string): Promise<number> {
		const key = this.createKey(gdpsid, configName);
		return await this.redis.del(key);
	}

	/**
	 * удаляет отдельное поле конфигурации
	 */
	public async deleteConfigField(gdpsid: string, configName: string, field: string): Promise<number> {
		const key = this.createKey(gdpsid, configName, field);
		return await this.redis.del(key);
	}

	/**
	 * проверяет существование конфигурации
	 */
	public async configExists(gdpsid: string, configName: string): Promise<boolean> {
		const key = this.createKey(gdpsid, configName);
		return (await this.redis.exists(key)) === 1;
	}

	/**
	 * проверяет существование поля конфигурации
	 */
	public async configFieldExists(gdpsid: string, configName: string, field: string): Promise<boolean> {
		const key = this.createKey(gdpsid, configName, field);
		return (await this.redis.exists(key)) === 1;
	}

	/**
	 * получает все конфигурации для определенного gdpsid
	 */
	public async getAllConfigs(gdpsid: string): Promise<{ [configName: string]: ConfigData }> {
		const pattern = `${this.keyPrefix}:${gdpsid}:*`;
		const keys = await this.redis.keys(pattern);
		const result: { [configName: string]: ConfigData } = {};

		for (const key of keys) {
			// Извлекаем configName из ключа
			const parts = key.split(":");
			if (parts.length >= 3) {
				const configName = parts[2];
				// Проверяем, что это не поле конфигурации (нет дополнительных частей)
				if (parts.length === 3) {
					const data = await this.redis.get(key);
					if (data) {
						result[configName] = JSON.parse(data);
					}
				}
			}
		}

		return result;
	}

	/**
	 * получает список всех имен конфигураций для gdpsid
	 */
	public async getConfigNames(gdpsid: string): Promise<string[]> {
		const pattern = `${this.keyPrefix}:${gdpsid}:*`;
		const keys = await this.redis.keys(pattern);
		const configNames = new Set<string>();

		for (const key of keys) {
			const parts = key.split(":");
			if (parts.length >= 3) {
				configNames.add(parts[2]);
			}
		}

		return Array.from(configNames);
	}

	/**
	 * получает список всех gdpsid
	 */
	public async getAllGdpsIds(): Promise<string[]> {
		const pattern = `${this.keyPrefix}:*`;
		const keys = await this.redis.keys(pattern);
		const gdpsIds = new Set<string>();

		for (const key of keys) {
			const parts = key.split(":");
			if (parts.length >= 2) {
				gdpsIds.add(parts[1]);
			}
		}

		return Array.from(gdpsIds);
	}

	/**
	 * удаляет все конфигурации для определенного gdpsid
	 */
	public async deleteAllConfigs(gdpsid: string): Promise<number> {
		const pattern = `${this.keyPrefix}:${gdpsid}:*`;
		const keys = await this.redis.keys(pattern);

		if (keys.length === 0) {
			return 0;
		}

		return await this.redis.del(...keys);
	}

	/**
	 * удаляет полностью gdpsid со всеми вложенными конфигурациями и полями
	 */
	public async deleteGdpsId(gdpsid: string): Promise<{ deletedKeys: number; deletedConfigs: string[] }> {
		const pattern = `${this.keyPrefix}:${gdpsid}:*`;
		const keys = await this.redis.keys(pattern);

		if (keys.length === 0) {
			return { deletedKeys: 0, deletedConfigs: [] };
		}

		// извлекаем уникальные имена конфигураций для отчёта
		const configNames = new Set<string>();
		for (const key of keys) {
			const parts = key.split(":");
			if (parts.length >= 3) {
				configNames.add(parts[2]);
			}
		}

		const deletedKeys = await this.redis.del(...keys);

		return {
			deletedKeys,
			deletedConfigs: Array.from(configNames)
		};
	}

	/**
	 * получает статистику по gdpsid (количество конфигураций и полей)
	 */
	public async getGdpsIdStats(gdpsid: string): Promise<{
		totalKeys: number;
		configCount: number;
		fieldCount: number;
		configs: { [configName: string]: number };
	}> {
		const pattern = `${this.keyPrefix}:${gdpsid}:*`;
		const keys = await this.redis.keys(pattern);

		const stats = {
			totalKeys: keys.length,
			configCount: 0,
			fieldCount: 0,
			configs: {} as { [configName: string]: number }
		};

		const configFields: { [configName: string]: number } = {};

		for (const key of keys) {
			const parts = key.split(":");
			if (parts.length >= 3) {
				const configName = parts[2];

				if (!configFields[configName]) {
					configFields[configName] = 0;
				}

				if (parts.length === 3) {
					// основная конфигурация
					stats.configCount++;
					configFields[configName]++;
				} else {
					// поле конфигурации
					stats.fieldCount++;
					configFields[configName]++;
				}
			}
		}

		stats.configs = configFields;
		return stats;
	}

	/**
	 * устанавливает TTL для конфигурации
	 */
	public async setConfigTTL(gdpsid: string, configName: string, ttlSeconds: number): Promise<boolean> {
		const key = this.createKey(gdpsid, configName);
		return (await this.redis.expire(key, ttlSeconds)) === 1;
	}

	/**
	 * получает TTL конфигурации
	 */
	public async getConfigTTL(gdpsid: string, configName: string): Promise<number> {
		const key = this.createKey(gdpsid, configName);
		return await this.redis.ttl(key);
	}

	/**
	 * инкрементирует числовое значение в конфигурации
	 */
	public async incrementConfigField(gdpsid: string, configName: string, field: string, increment: number = 1): Promise<number> {
		const key = this.createKey(gdpsid, configName, field);
		return await this.redis.incrby(key, increment);
	}

	/**
	 * добавляет элемент в список (если поле является массивом)
	 */
	public async pushToConfigList(gdpsid: string, configName: string, field: string, value: any): Promise<void> {
		const currentValue = await this.getConfigField(gdpsid, configName, field);
		const list = Array.isArray(currentValue) ? currentValue : [];
		list.push(value);
		await this.setConfigField(gdpsid, configName, field, list);
	}

	/**
	 * закрывает соединение с Redis
	 */
	public async disconnect(): Promise<void> {
		await this.redis.quit();
	}

	/**
	 * получает информацию о соединении
	 */
	public getConnectionStatus(): string {
		return this.redis.status;
	}

	/**
	 * выполняет пинг Redis сервера
	 */
	public async ping(): Promise<string> {
		return await this.redis.ping();
	}
}
