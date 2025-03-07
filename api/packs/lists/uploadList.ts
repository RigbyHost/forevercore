import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../../serverconf/db';
import ExploitPatch from '../../lib/exploitPatch';
import GJPCheck from '../../lib/GJPCheck';
import ConsoleApi from '../../../modules/console-api';

/**
 * Uploads a list in Geometry Dash
 * @param req - Express request with required parameters
 * @returns List ID if successful, "-100" if bad secret, "-6" if failed, "-9" if invalid account
 */
const uploadList = async (req: Request): Promise<string> => {
  try {
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
    const listID = await ExploitPatch.number(req.body.listID);
    
    // Process list parameters
    const listName = (req.body.listName && await (ExploitPatch.remove(req.body.listName) != "")) 
      ? (await ExploitPatch.remove(req.body.listName)) 
      : "Unnamed List";
    
    const listDesc = await ExploitPatch.remove(req.body.listDesc);
    const listLevels = await ExploitPatch.remove(req.body.listLevels);
    const difficulty = await ExploitPatch.number(req.body.difficulty);
    const listVersion = await ExploitPatch.number(req.body.listVersion) === 0 
      ? 1 
      : (await ExploitPatch.number(req.body.listVersion));
    
    const original = await ExploitPatch.number(req.body.original);
    const unlisted = await ExploitPatch.number(req.body.unlisted);
    const secret = await ExploitPatch.remove(req.body.secret);
    
    // Validate request
    if (secret !== "Wmfd2893gb7") return "-100";
    if (listLevels.split(',').length === 0) return "-6";
    if (isNaN(Number(accountID))) return "-9";
    
    // Check if updating an existing list
    if (listID !== 0) {
      const [rows] = await db.query<RowDataPacket[]>(
        'SELECT * FROM lists WHERE listID = ? AND accountID = ?', 
        [listID, accountID]
      );
      
      if (rows.length > 0) {
        // Update existing list
        await db.query(
          'UPDATE lists SET listDesc = ?, listVersion = ?, listlevels = ?, starDifficulty = ?, original = ?, unlisted = ?, updateDate = ? WHERE listID = ?',
          [
            listDesc, 
            listVersion, 
            listLevels, 
            difficulty, 
            original, 
            unlisted, 
            Math.floor(Date.now() / 1000), 
            listID
          ]
        );
        
        return listID.toString();
      }
    }
    
    // Create new list
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO lists (listName, listDesc, listVersion, accountID, listlevels, starDifficulty, original, unlisted, uploadDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        listName, 
        listDesc, 
        listVersion, 
        accountID, 
        listLevels, 
        difficulty, 
        original, 
        unlisted, 
        Math.floor(Date.now() / 1000)
      ]
    );
    
    ConsoleApi.Log("main", `Uploaded level list: ${listName} (${listID})`);
    return result.insertId.toString();
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.uploadList`);
    return "-6";
  }
};

export default uploadList;