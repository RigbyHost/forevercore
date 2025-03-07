import { ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Changes a user's username
 * @param newusr - New username
 * @param userName - Current username
 * @returns "1" if successful, "-2" if username too long, "-3" if username too short, undefined if error
 */
const changeUsername = async (
  newusr: string,
  userName: string
): Promise<string | undefined> => {
  try {
    // Validate username length
    if (newusr.length > 20) {
      ConsoleApi.Log("main", `Panel action: new username "${newusr}" more than 20 symbols`);
      return "-2";
    } 
    
    if (newusr.length < 3) {
      ConsoleApi.Log("main", `Panel action: new username "${newusr}" less than 3 symbols`);
      return "-3";
    }
    
    // Update username
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE accounts SET username = ? WHERE userName = LOWER(?)",
      [newusr, userName]
    );
    
    ConsoleApi.Log("main", `Panel action: username changed (${userName} => ${newusr})`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changeUsername`);
    return undefined;
  }
};

export default changeUsername;