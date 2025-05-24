import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

interface GlobalConfig {
	'online-mode': boolean;
}

/** Проверяет, искать ли в реестре GDPS. В /config/global.yml установите online-mode: false для одиночных GDPS на самохосте чтобы игнорировать проверку в реестре
 * @returns true - online-mode = true, false - online-mode = false (пиратский)
 */
export default function isOnlineMode(): boolean {
	const defaultConfig: GlobalConfig = {
		'online-mode': true
	};
	try {
		const yamlPath = path.join(__dirname, '../config/global.yml');
		const fileContents = fs.readFileSync(yamlPath, 'utf8');
		const parsedYaml = yaml.load(fileContents) as GlobalConfig;
		return parsedYaml['online-mode'] === true;
	} catch (error) {
		console.error("Ошибка при загрузке global.yml:", error);
		return defaultConfig['online-mode'];
	}
}