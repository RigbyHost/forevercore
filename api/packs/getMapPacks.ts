import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GenerateHash from '../lib/generateHash';
import ConsoleApi from '../../modules/console-api';

/**
 * Interface for map pack data
 */
interface MapPackData extends RowDataPacket {
  colors2: string;
  rgbcolors: string;
  ID: number;
  name: string;
  levels: string;
  stars: number;
  coins: number;
  difficulty: number;
}

/**
 * Gets map packs for Geometry Dash
 * @param req - Express request with page parameter
 * @returns Formatted map packs string, "-1" if failed
 */
const getMapPacks = async (req: Request): Promise<string> => {
  try {
    // Get page parameter
    const page = await ExploitPatch.remove(req.body.page);
    const packpage = parseInt(page) * 10;
    
    let mappackstring = "";
    let lvlsmultistring = "";
    
    // Get map packs data
    const [result] = await db.query<MapPackData[]>(
      "SELECT colors2, rgbcolors, ID, name, levels, stars, coins, difficulty FROM `mappacks` ORDER BY `ID` ASC LIMIT 10 OFFSET ?",
      [packpage]
    );
    
    const packcount = result.length;
    
    // Process each map pack
    for (const mappack of result) {
      lvlsmultistring += `${mappack.ID},`;
      
      // Handle colors
      let colors2 = mappack.colors2;
      if (colors2 == "none" || colors2 == "") {
        colors2 = mappack.rgbcolors;
      }
      
      // Build map pack string
      mappackstring += `1:${mappack.ID}:2:${mappack.name}:3:${mappack.levels}:4:${mappack.stars}:5:${mappack.coins}:6:${mappack.difficulty}:7:${mappack.rgbcolors}:8:${colors2}|`;
    }
    
    // Get total pack count
    const [totalPackCountResult] = await db.query<RowDataPacket[]>("SELECT count(*) as count FROM mappacks");
    const totalpackcount = totalPackCountResult[0].count;
    
    // Remove trailing separators
    mappackstring = mappackstring.slice(0, -1);
    lvlsmultistring = lvlsmultistring.slice(0, -1);
    
    // Generate hash and build response
    const response = `${mappackstring}#${totalpackcount}:${packpage}:10#${await GenerateHash.genPack(lvlsmultistring)}`;
    
    ConsoleApi.Log("main", `Received MapPack chunk mpch.0.${page}`);
    return response;
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.getMapPacks`);
    return "-1";
  }
};

export default getMapPacks;