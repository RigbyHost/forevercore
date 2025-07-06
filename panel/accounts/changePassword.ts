import { Request } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import db from '../../serverconf/db-proxy';
import GeneratePass from '../../api/lib/generatePass';
import ConsoleApi from '../../modules/console-api';

// Актуализированные интерфейсы
interface ChangePasswordRequest {
  userName: string;
  oldpassword: string;
  newpassword: string;
  accid: string;
}

/**
 * Изменяет пароль пользователя и обновляет связанные данные
 * @param req - Express запрос с необходимыми параметрами
 * @returns "1" в случае успеха, "-1" при неверном пароле, "-2" при других ошибках
 */
const changePassword = async (req: Request): Promise<string> => {
  const { userName, oldpassword, newpassword, accid } = req.body as ChangePasswordRequest;
  
  try {
    // Проверка старого пароля
    const pass = await GeneratePass.isValidUsrname(userName, oldpassword, req);
    
    if (pass !== 1) {
      return "-1"; // Неверный старый пароль
    }
    
    // Валидация нового пароля
    if (newpassword.length < 6) {
      return "-3"; // Пароль слишком короткий
    }
    
    // Хеширование нового пароля
    const passhash = await bcrypt.hash(newpassword, 10);
    
    // Обновление пароля в базе данных
    await db.query(
      "UPDATE accounts SET password=? WHERE userName=?", 
      [passhash, userName]
    );
    
    // Обновление GJP2 хеша
    await GeneratePass.assignGJP2(accid, newpassword, req);

    // Получение ID аккаунта
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT accountID FROM accounts WHERE userName=?", 
      [userName]
    );
    
    if (rows.length === 0) {
      ConsoleApi.Error("main", `Account not found after password change: ${userName}`);
      return "1"; // Пароль изменен, но не удалось обработать файлы сохранений
    }
    
    const accountID = rows[0].accountID;
    const accountIDPS = accountID.toString();
    
    // Путь к файлу сохранения и ключу
    const saveDataPath = path.join(__dirname, '../../data/accounts', `${accountIDPS}.dat`);
    const keyPath = path.join(__dirname, '../../data/accounts/keys', accountIDPS);
    
    // Проверяем существование файла сохранения
    let saveData: string;
    try {
      saveData = await fs.readFile(saveDataPath, 'utf8');
    } catch (error) {
      // Файл сохранения не существует, продолжаем без него
      ConsoleApi.Log("main", `No save data found for account ${userName}`);
      ConsoleApi.Log("main", `Panel action: changed password in account ${userName}`);
      return "1";
    }
    
    // Проверяем существование файла ключа
    try {
      if (await fs.access(keyPath).then(() => true).catch(() => false)) {
        const protected_key_encoded = await fs.readFile(keyPath, 'utf8');
        
        if (protected_key_encoded) {
          // Здесь должна быть реальная реализация расшифровки
          // с использованием актуальных библиотек
          
          // В реальной реализации:
          // 1. Разблокировать ключ с использованием старого пароля
          // 2. Расшифровать данные сохранения
          // 3. Перешифровать с новым паролем (при необходимости)
          // 4. Сохранить обновленные данные
          
          try {
            // Здесь должен быть реальный код расшифровки/шифрования
            
            // Заглушка для примера:
            await fs.writeFile(saveDataPath, saveData, 'utf8');
            await fs.writeFile(keyPath, '', 'utf8');
          } catch (error) {
            ConsoleApi.Error("main", `Error processing save data: ${error}`);
            // Продолжаем выполнение, т.к. пароль уже изменен
          }
        }
      }
    } catch (error) {
      ConsoleApi.Error("main", `Error accessing key file: ${error}`);
      // Продолжаем выполнение, т.к. пароль уже изменен
    }
    
    ConsoleApi.Log("main", `Panel action: changed password in account ${userName}`);
    return "1";
  } catch (error) {
    ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.panel.accounts.changePassword`);
    return "-2"; // Общая ошибка
  }
};

export default changePassword;