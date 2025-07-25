import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

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

function loadChestConfig(id: string): ChestsYamlConfig {
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
		const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/chests.yml`);
		const fileContents = fs.readFileSync(yamlPath, "utf8");
		return yaml.load(fileContents) as ChestsYamlConfig;
	} catch (error) {
		console.error(`Ошибка при загрузке конфигурации сундуков для ID ${id}:`, error);
		return defaultConfig;
	}
}

/** Getting configuration for small chests from containers
 * @param id <string> container ID
 * @returns small chest config object
 */
export function getSmallChest(id: string): ChestConfig {
	const parsedYaml = loadChestConfig(id);
	return parsedYaml.smallChest;
}

/** Getting configuration for small chests from containers
 * @param id <string> container ID
 * @returns small chest config object
 */
export function getBigChest(id: string): ChestConfig {
	const parsedYaml = loadChestConfig(id);
	return parsedYaml.bigChest;
}
