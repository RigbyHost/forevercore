import { getMusicState } from './serverconf/music';
// import manDB from './serverconf/man-db'
import { SystemControl as Control } from './SystemControl/SystemControl';

/// ADVANCED TYPES ///
type int = number;
type float = number;
type bool = boolean;
type array = (string | number)[];
type json = string;
/// ---------------///

async function test() {
	/* const result: string = (await Control.connection.checkActive("3002", "n01")) ? "GDPS включён" : "GDPS выключен";
	console.log(result); */
	
	const mda: number = Infinity;
	const adm: number = -Infinity;
	
	console.log(a);
	
	process.exit(0);
}
test(); 