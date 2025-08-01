import { getSettings } from "@/serverconf/settings";

(async () => {
	console.log(await getSettings("3002"));
})();

