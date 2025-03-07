import { Request } from 'express';
import { ResultSetHeader } from 'mysql2/promise';
import db from '../../../serverconf/db';
import ExploitPatch from '../../lib/exploitPatch';
import ApiLib from '../../lib/apiLib';
import GJPCheck from '../../lib/GJPCheck';
import ConsoleApi from '../../../modules/console-api';

/**
 * Deletes a list in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const deleteList = async (req: Request): Promise<string> => {
  try {
    // Authenticate user
    const accountID = await GJPCheck.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
    const listID = await ExploitPatch.number(req.body.listID);
    
    // Check if user owns the list
    if (isNaN(Number(listID)) || accountID != await ApiLib.getListOwner(listID)) {
      return "-1";
    }
    
    // Delete the list
    const [result] = await db.execute<ResultSetHeader>(
      'DELETE FROM lists WHERE listID = ?', 
      [listID]
    );
    
    ConsoleApi.Log("main", `List ${listID} deleted by accountID: ${accountID}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.packs.lists.deleteList`);
    return "-1";
  }
};

export default deleteList;