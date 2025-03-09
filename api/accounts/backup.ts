import { Request } from 'express';
import path from 'path';
import fs from 'fs/promises';
import db from '../../serverconf/db';
import ExploitPatch from '../lib/exploitPatch';
import GeneratePass from '../lib/generatePass';
import ConsoleApi from '../../modules/console-api';
import { settings } from '../../serverconf/settings';

/**
 * Структура для разбора данных сохранения
 */
interface SaveData {
  orbs: string;
  levels: string;
  password?: string;
}

/**
 * Бэкапит аккаунт Geometry Dash в базу данных и на диск
 * @param userNameOr - Имя пользователя
 * @param passwordOr - Пароль
 * @param saveDataOr - Данные сохранения
 * @param accountIDOr - ID аккаунта
 * @param gjp2Or - GJP2 хеш
 * @param req - Express запрос
 * @returns "1" если успешно, "-1" если ошибка
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
    
    // Базовая валидация входных данных
    if (!saveDataOr || (!userNameOr && !accountIDOr)) {
      ConsoleApi.Error("main", `Failed to backup account: missing required parameters`);
      return "-1";
    }

    // Получить имя пользователя, если не предоставлено
    let userName: string | null = null;
    let accountID: string | number | null = null;

    // Получение accountID и userName
    try {
      if (!userNameOr) {
        accountID = await ExploitPatch.remove(accountIDOr);
        const [rows] = await db.execute<any[]>(
          "SELECT userName FROM accounts WHERE accountID = ?", 
          [accountID]
        );
        userName = rows.length ? rows[0].userName : null;
      } else {
        userName = await ExploitPatch.remove(userNameOr);
        if (!accountIDOr) {
          const [rows] = await db.execute<any[]>(
            "SELECT accountID FROM accounts WHERE userName = ?", 
            [userName]
          );
          accountID = rows.length ? rows[0].accountID : null;
        } else {
          accountID = ExploitPatch.remove(accountIDOr);
        }
      }

      // Проверить ID аккаунта
      if (!accountID || !isFinite(Number(accountID))) {
        ConsoleApi.Log("main", `Failed to backup account: ${accountID} - invalid ID`);
        return "-1";
      }
    } catch (err) {
      ConsoleApi.Error("main", `Error getting account info: ${err}`);
      return "-1";
    }

    // Проверить пароль
    let pass = 0;
    try {
      if (passwordOr) {
        pass = await GeneratePass.isValid(accountID, passwordOr, req);
      } else if (gjp2Or) {
        pass = await GeneratePass.isGJP2Valid(accountID, gjp2Or, req);
      }

      if (pass !== 1) {
        ConsoleApi.Log("main", `Failed to backup account. ID: ${accountID} - authentication failed`);
        return "-1";
      }
    } catch (err) {
      ConsoleApi.Error("main", `Error in authentication: ${err}`);
      return "-1";
    }

    // Обработка данных сохранения
    let saveDataArr: string[] = [];
    let saveDataDecoded: string = '';
    let orbs: string = "0";
    let lvls: string = "0";
    
    try {
      saveDataArr = saveDataOr.split(";");
      saveDataDecoded = Buffer.from(saveDataArr[0].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
      
      // Извлечь сферы и уровни из данных сохранения
      const saveDataParsed: SaveData = {
        orbs: "0",
        levels: "0"
      };
      
      // Безопасно извлекаем данные
      const orbsMatch = saveDataDecoded.match(/<k>14<\/k><s>([^<]+)<\/s>/);
      if (orbsMatch && orbsMatch[1]) {
        saveDataParsed.orbs = orbsMatch[1];
      }
      
      const lvlsMatch = saveDataDecoded.match(/<k>GS_value<\/k>.*?<k>4<\/k><s>([^<]+)<\/s>/);
      if (lvlsMatch && lvlsMatch[1]) {
        saveDataParsed.levels = lvlsMatch[1];
      }
      
      orbs = saveDataParsed.orbs;
      lvls = saveDataParsed.levels;
      
      // Маскировать пароль в данных сохранения
      if (passwordOr) {
        saveDataDecoded = saveDataDecoded.replace(
          new RegExp(`<k>GJA_002</k><s>${passwordOr}</s>`, 'g'), 
          "<k>GJA_002</k><s>password</s>"
        );
      }
    } catch (err) {
      ConsoleApi.Error("main", `Error parsing save data: ${err}`);
      // Продолжаем выполнение с дефолтными значениями
    }
    
    // Сохранить данные в БД
    try {
      const query = `UPDATE accounts SET saveData = ?, lastBackup = ? WHERE accountID = ?`;
      await db.execute(query, [saveDataOr, Math.floor(Date.now() / 1000), accountID]);
    } catch (err) {
      ConsoleApi.Error("main", `Error updating account data in DB: ${err}`);
      return "-1";
    }

    // Обновить статистику пользователя (сферы и уровни)
    try {
      if (userNameOr) {
        const [rows] = await db.execute<any[]>(
          "SELECT extID FROM users WHERE userName = ? LIMIT 1", 
          [userNameOr]
        );
        if (rows.length > 0) {
          const extID = rows[0].extID;
          await db.execute(
            "UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE extID = ?", 
            [orbs, lvls, extID]
          );
        }
      } else {
        const [rows] = await db.execute<any[]>(
          "SELECT userName FROM users WHERE extID = ? LIMIT 1", 
          [accountID]
        );
        if (rows.length > 0) {
          const userNameFin = rows[0].userName;
          await db.execute(
            "UPDATE `users` SET `orbs` = ?, `completedLvls` = ? WHERE userName = ?", 
            [orbs, lvls, userNameFin]
          );
        }
      }
    } catch (err) {
      ConsoleApi.Error("main", `Error updating user stats: ${err}`);
      // Продолжаем даже если не удалось обновить статистику
    }

    // Сохранить данные на диск
    try {
      // Создать директорию для бэкапов, если не существует
      const backupDir = path.join(__dirname, '..', '..', 'data', 'backups');
      await fs.mkdir(backupDir, { recursive: true });
      
      // Создать поддиректорию для пользователя
      const userBackupDir = path.join(backupDir, `${accountID}`);
      await fs.mkdir(userBackupDir, { recursive: true });
      
      // Сохранить данные
      const timestamp = Math.floor(Date.now() / 1000);
      const backupFile = path.join(userBackupDir, `backup_${timestamp}.dat`);
      
      // Сохраняем исходные данные
      await fs.writeFile(backupFile, saveDataOr);
      
      // Сохраняем декодированные данные для отладки
      const decodedBackupFile = path.join(userBackupDir, `backup_decoded_${timestamp}.dat`);
      await fs.writeFile(decodedBackupFile, saveDataDecoded);
      
      // Удаляем старые бэкапы, если превышено максимальное количество
      const MAX_BACKUPS = settings.maxAccountBackups || 5;
      const files = await fs.readdir(userBackupDir);
      
      // Фильтруем только файлы формата backup_*.dat
      const backupFiles = files
        .filter(file => file.match(/^backup_\d+\.dat$/))
        .map(file => ({
          name: file,
          path: path.join(userBackupDir, file),
          time: parseInt(file.replace('backup_', '').replace('.dat', ''))
        }))
        .sort((a, b) => b.time - a.time); // Сортируем по времени (самые новые первые)
      
      // Удаляем все бэкапы после максимального допустимого количества
      if (backupFiles.length > MAX_BACKUPS) {
        for (let i = MAX_BACKUPS; i < backupFiles.length; i++) {
          await fs.unlink(backupFiles[i].path);
        }
      }
    } catch (err) {
      ConsoleApi.Error("main", `Error saving backup to disk: ${err}`);
      // Не прерываем выполнение, так как данные уже сохранены в БД
    }

    ConsoleApi.Log("main", `Account backed up successfully. ID: ${accountID}`);
    return "1";
  } catch (err) {
    ConsoleApi.Error("main", `${err} at net.fimastgd.forevercore.api.accounts.backup`);
    return "-1";
  }
};

export default backupAccount;
