import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

interface ServerSettings {
	serverName: string;
	GDPSID: string;
	NodeName: string;
	topCount: number;
	objectLimitFU: boolean;
	objectLimitCount: number;
	diffVote: boolean;
	diffVoteLevel: number;
	hardDiffVote: boolean;
	serverURL: string;
	sessionGrants: boolean;
	unregisteredSubmissions: boolean;
	maxAccountBackups: number; // Максимальное количество бэкапов для каждого аккаунта
}

function loadServerSettings(id: string): ServerSettings {
	const defaultSettings: ServerSettings = {
		serverName: "GDPS",
		GDPSID: "",
		NodeName: "n01",
		sessionGrants: false,
		unregisteredSubmissions: false,
		topCount: 100,
		objectLimitFU: true,
		objectLimitCount: 100,
		diffVote: true,
		diffVoteLevel: 3,
		hardDiffVote: false,
		serverURL: "http://localhost:3005",
		maxAccountBackups: 1
	};

	try {
		const yamlPath = path.join(__dirname, `../GDPS_DATA/${id}/data/config/settings.yml`);
		const fileContents = fs.readFileSync(yamlPath, "utf8");
		return yaml.load(fileContents) as ServerSettings;
	} catch (error) {
		console.error(`Ошибка при загрузке конфигурации сервера для ID ${id}:`, error);
		return defaultSettings;
	}
}

export function getSettings(id: string): ServerSettings {
	return loadServerSettings(id);
}
