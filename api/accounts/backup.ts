// api/accounts/backup.ts
import { Request } from 'express';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GeneratePass from '../lib/generatePass';
import ConsoleApi from '../../modules/console-api';

/**
 * Backs up a GD account to database
 * @param userNameOr - Username
 * @param passwordOr - Password
 * @param saveDataOr - Save data
 * @param accountIDOr - Account ID
 * @param gjp2Or - GJP2 hash
 * @param req - Express request
 * @returns "1" if successful, "-1" if failed
 */
const backupAccount = async (
  userNameOr?: string,
  passwordOr?: string,
  saveDataOr?: string,
  accountIDOr?: string,
  gjp2Or?: string,
  req?: Request
): Promise<string> => {
  try {
    // Логируем запрос
    ConsoleApi.Log("main", `Backup request received for account ${accountIDOr || userNameOr}`);
    
    // Очистка таймаута, если существует
    if (typeof setTimeout === "function") {
      setTimeout(() => {}, 0);
    }

    // Получить имя пользователя, если не предоставлено
    let userName: string | null = null;
    if (typeof userNameOr === "undefined") {
      const [rows] = await db.execute<any[]>(
        "SELECT userName FROM accounts WHERE accountID = ?", 
        [accountIDOr]
      );
      userName = rows.length ? rows[0].userName : null;
    } else {
      userName = await ExploitPatch.remove(userNameOr);
    }

    const password = passwordOr || "";
    const saveData = await ExploitPatch.remove(saveDataOr);

    // Получить ID аккаунта
    let accountID: string | number | null;
    if (!accountIDOr) {
      const [rows] = await db.execute<any[]>(
        "SELECT accountID FROM accounts WHERE userName = ?", 
        [userName]
      );
      accountID = rows.length ? rows[0].accountID : null;
    } else {
      accountID = ExploitPatch.remove(accountIDOr);
    }

    // Проверить ID аккаунта
    if (!accountID || !isFinite(Number(accountID))) {
      ConsoleApi.Log("main", `Failed to backup account: ${accountID} - invalid ID`);
      return "-1";
    }

    // Проверить пароль
    let pass = 0;
    if (passwordOr) {
      pass = await GeneratePass.isValid(accountID, passwordOr, req);
    } else if (gjp2Or) {
      pass = await GeneratePass.isGJP2Valid(accountID, gjp2Or, req);
    }

    if (pass === 1) {
      // Обработка данных сохранения
      let saveDataArr = saveDataOr.split(";");
      let saveDataDecoded = saveDataArr[0].replace(/-/g, "+").replace(/_/g, "/");
      saveDataDecoded = Buffer.from(saveDataDecoded, "base64").toString();
      
      // Извлечь сферы и уровни из данных сохранения - с предварительной проверкой наличия нужных данных
      let orbs = "0";
      let lvls = "0";
      
      try {
        // Безопасно извлекаем данные, проверяя наличие ожидаемых частей
        const orbsMatch = saveDataDecoded.match(/<k>14<\/k><s>([^<]+)<\/s>/);
        if (orbsMatch && orbsMatch[1]) {
          orbs = orbsMatch[1];
        }
        
        const lvlsMatch = saveDataDecoded.match(/<k>GS_value<\/k>.*?<k>4<\/k><s>([^<]+)<\/s>/);
        if (lvlsMatch && lvlsMatch[1]) {
          lvls = lvlsMatch[1];
        }
      } catch (err) {
        ConsoleApi.Error("main", `Error parsing save data: ${err}`);
        // Продолжаем выполнение с дефолтными значениями
      }

      // Маскировать пароль в данных сохранения
      if (passwordOr) {
        try {
          saveDataDecoded = saveDataDecoded.replace(
            new RegExp(`<k>GJA_002</k><s>${passwordOr}</s>`, 'g'), 
            "<k>GJA_002</k><s>password</s>"
          );
        } catch (err) {
          ConsoleApi.Error("main", `Error masking password: ${err}`);
          // Продолжаем выполнение даже если не удалось замаскировать пароль
        }
      }
      
      // Сохранить данные в БД
      const query = `UPDATE accounts SET saveData = ?, lastBackup = ? WHERE accountID = ?`;
      await db.execute(query, [saveDataOr, Math.floor(Date.now() / 1000), accountID]);

      // Получить ID пользователя и обновить сферы и уровни
      let userNameFin: string;
      let extID: string;
      
      if (userNameOr) {
        const [rows] = await db.execute<any[]>(
          "SELECT extID FROM users WHERE userName = ? LIMIT 1", 
          [userNameOr]
        );
        if (rows.length > 0) {
          extID = rows[0].extID;
          await db.execute(
            "UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE extID = ?", 
            [orbs, lvls, extID]
          );
        }
      } else {
        const [rows] = await db.execute<any[]>(
          "SELECT userName FROM users WHERE extID = ? LIMIT 1", 
          [accountIDOr]
        );
        if (rows.length > 0) {
          userNameFin = rows[0].userName;
          await db.execute(
            "UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE userName = ?", 
            [orbs, lvls, userNameFin]
          );
        }
      }

      ConsoleApi.Log("main", `Account backed up successfully. ID: ${accountID}`);
      return "1";
    } else {
      ConsoleApi.Log("main", `Failed to backup account. ID: ${accountID} - authentication failed`);
      return "-1";
    }
  } catch (err) {
    ConsoleApi.Error("main", `${err} at net.fimastgd.forevercore.api.accounts.backup`);
    return "-1";
  }
};

export default backupAccount;