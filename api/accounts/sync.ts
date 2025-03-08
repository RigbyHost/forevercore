// api/accounts/sync.ts
import { Request } from 'express';
import { RowDataPacket } from 'mysql2/promise';
import db from '../../serverconf/db';
import GeneratePass from '../lib/generatePass';
import ExploitPatch from '../lib/exploitPatch';
import ConsoleApi from '../../modules/console-api';

/**
 * Syncs a GD account save data from database
 * @param userNameStr - Username
 * @param accountIDStr - Account ID
 * @param passwordStr - Password
 * @param gjp2Str - GJP2 hash
 * @param req - Express request
 * @returns Save data if successful, "-1" if failed, "-2" if invalid password
 */
const syncAccount = async (
  userNameStr?: string,
  accountIDStr?: string,
  passwordStr?: string,
  gjp2Str?: string,
  req?: Request
): Promise<string> => {
  try {
    // Логируем запрос
    ConsoleApi.Log("main", `Sync request received for account ${accountIDStr || userNameStr}`);
    
    const password = passwordStr || "";
    let accountID = accountIDStr || "";

    // Получить ID аккаунта по имени пользователя, если не предоставлен
    if (!accountID) {
      const userName = await ExploitPatch.remove(userNameStr);
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT accountID FROM accounts WHERE userName = ?", 
        [userName]
      );
      accountID = rows.length ? rows[0].accountID.toString() : null;
      
      if (!accountID) {
        ConsoleApi.Log("main", `Failed to sync account: account not found`);
        return "-1";
      }
    } else {
      accountID = await ExploitPatch.remove(accountIDStr);
    }

    // Проверить учетные данные
    let pass = 0;
    if (passwordStr) {
      pass = await GeneratePass.isValid(accountID, passwordStr, req);
    } else if (gjp2Str) {
      pass = await GeneratePass.isGJP2Valid(accountID, gjp2Str, req);
    }

    if (pass === 1) {
      // Получить данные сохранения из БД
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT saveData FROM accounts WHERE accountID = ?", 
        [accountID]
      );
      
      if (rows.length === 0 || !rows[0].saveData) {
        ConsoleApi.Log("main", `Failed to sync account ${accountID}: no save data found`);
        return "-1";
      }
      
      const saveData = rows[0].saveData;
      
      // Обновить время последней синхронизации
      await db.execute(
        "UPDATE accounts SET lastSync = ? WHERE accountID = ?", 
        [Math.floor(Date.now() / 1000), accountID]
      );
      
      ConsoleApi.Log("main", `Synced account: ${accountID}`);
      
      // Возвращаем данные в нужном формате
      return `${saveData};21;30;a;a`;
    } else {
      ConsoleApi.Log("main", `Failed to sync account: ${accountID} - authentication failed`);
      return "-2";
    }
  } catch (error) {
    ConsoleApi.Warn("main", `Check the data for damage at net.fimastgd.forevercore.api.accounts.sync`);
    ConsoleApi.Error("main", `Unhandled server exception with user sync account: ${error}`);
    return "-1";
  }
};

export default syncAccount;