import { ResultSetHeader } from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import db from '../../serverconf/db';
import ConsoleApi from '../../modules/console-api';

/**
 * Удаляет аккаунт пользователя и все связанные данные
 * @param accountID - ID аккаунта для удаления
 * @param requestingUserID - ID пользователя, запрашивающего удаление (для проверки прав)
 * @returns "1" если успешно, "-1" если произошла ошибка, "-2" если нет прав доступа
 */
const deleteAccount = async (
  accountID: string | number,
  requestingUserID?: string | number
): Promise<string> => {
  // Начинаем транзакцию для атомарного удаления
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Если передан ID запрашивающего пользователя, проверяем права доступа
    if (requestingUserID && requestingUserID !== accountID) {
      // Проверка, является ли запрашивающий администратором
      const [adminCheck] = await connection.query<ResultSetHeader[]>(
        'SELECT roleID FROM roleassign WHERE accountID = ?', 
        [requestingUserID]
      );
      
      // Проверка наличия прав администратора (roleID = 1 для админа)
      // Логика проверки должна соответствовать вашей системе ролей
      const isAdmin = adminCheck.some(row => row.roleID === 1);
      
      if (!isAdmin) {
        await connection.rollback();
        return "-2"; // Нет прав доступа
      }
    }
    
    // Сначала получаем информацию об аккаунте для логирования
    const [accountInfo] = await connection.query(
      'SELECT userName FROM accounts WHERE accountID = ?',
      [accountID]
    );
    
    const userName = accountInfo.length > 0 ? accountInfo[0].userName : 'unknown';
    
    // Удаление данных аккаунта из всех связанных таблиц
    
    // 1. Удаление записей о лайках
    await connection.query(
      'DELETE FROM likes WHERE accountID = ?',
      [accountID]
    );
    
    // 2. Удаление сообщений
    await connection.query(
      'DELETE FROM messages WHERE senderID = ? OR recipientID = ?',
      [accountID, accountID]
    );
    
    // 3. Удаление комментариев
    await connection.query(
      'DELETE FROM comments WHERE authorID = ?',
      [accountID]
    );
    
    // 4. Удаление комментариев к аккаунту
    await connection.query(
      'DELETE FROM acccomments WHERE authorID = ? OR accountID = ?',
      [accountID, accountID]
    );
    
    // 5. Удаление из таблицы ролей
    await connection.query(
      'DELETE FROM roleassign WHERE accountID = ?',
      [accountID]
    );
    
    // 6. Удаление из таблицы пользователей
    const [userResult] = await connection.query<ResultSetHeader>(
      'DELETE FROM users WHERE extID = ?', 
      [accountID]
    );
    
    // 7. Удаление из таблицы аккаунтов
    const [accountResult] = await connection.query<ResultSetHeader>(
      'DELETE FROM accounts WHERE accountID = ?', 
      [accountID]
    );
    
    // Сохраняем информацию об удалении для аудита
    await connection.query(
      'INSERT INTO deleted_accounts (accountID, userName, deletedAt, deletedBy) VALUES (?, ?, NOW(), ?)',
      [accountID, userName, requestingUserID || null]
    ).catch(err => {
      // Игнорируем ошибку, если таблица не существует
      ConsoleApi.Warn("main", `Could not log account deletion: ${err}`);
    });
    
    // Применяем изменения в БД
    await connection.commit();
    
    // Удаление файлов аккаунта
    const accIDStr = accountID.toString();
    
    // Безопасно формируем пути к файлам
    const accountPath = path.join(__dirname, '../../data/accounts', `${accIDStr}.dat`);
    const keysPath = path.join(__dirname, '../../data/accounts/keys', accIDStr);
    
    // Удаляем файлы с обработкой ошибок
    await fs.unlink(accountPath).catch(err => {
      if (err.code !== 'ENOENT') {
        ConsoleApi.Error("main", `Error deleting account save data: ${err}`);
      }
    });
    
    await fs.unlink(keysPath).catch(err => {
      if (err.code !== 'ENOENT') {
        ConsoleApi.Error("main", `Error deleting account key: ${err}`);
      }
    });
    
    ConsoleApi.Log("main", `Panel action: deleted account. accountID: ${accountID}, userName: ${userName}`);
    return "1";
  } catch (error) {
    // Откатываем транзакцию при ошибке
    await connection.rollback();
    ConsoleApi.Error("main", `${error} net.fimastgd.forevercore.panel.accounts.deleteAccount`);
    return "-1";
  } finally {
    // Возвращаем соединение в пул
    connection.release();
  }
};

export default deleteAccount;