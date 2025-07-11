import { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash, hashPassword, verifyPassword } from '../../utils/crypto.js';

/**
 * Accounts API endpoints - GD compatible
 */
export async function registerAccountsRoutes(fastify: FastifyInstance) {
  
  // Login account
  fastify.post('/database/accounts/loginGJAccount.php', async (request, reply) => {
    const body = request.body as any;
    const userName = body.userName;
    const password = body.password;
    const udid = body.udid;
    
    if (!userName || !password) {
      return '-1';
    }
    
    try {
      const account = await fastify.db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.userName, userName))
        .limit(1);
      
      if (!account.length) {
        return '-1';
      }
      
      const accountData = account[0];
      
      // Check if account is active
      if (!accountData.isActive) {
        return '-1';
      }
      
      // Verify password
      const isValid = await verifyPassword(password, accountData.password);
      if (!isValid) {
        return '-1';
      }
      
      // Get user data
      const user = await fastify.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.extID, accountData.accountID))
        .limit(1);
      
      const userID = user.length ? user[0].userID : 0;
      
      return `${accountData.accountID},${userID}`;
      
    } catch (error) {
      fastify.log.error('Error logging in:', error);
      return '-1';
    }
  });
  
  // Register account
  fastify.post('/database/accounts/registerGJAccount.php', async (request, reply) => {
    const body = request.body as any;
    const userName = body.userName;
    const password = body.password;
    const email = body.email;
    
    if (!userName || !password || !email) {
      return '-1';
    }
    
    try {
      // Check if username exists
      const existingAccount = await fastify.db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.userName, userName))
        .limit(1);
      
      if (existingAccount.length) {
        return '-1'; // Username taken
      }
      
      // Check if email exists
      const existingEmail = await fastify.db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.email, email))
        .limit(1);
      
      if (existingEmail.length) {
        return '-1'; // Email taken
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create account
      const [accountResult] = await fastify.db
        .insert(schema.accounts)
        .values({
          userName,
          password: hashedPassword,
          email,
          registerDate: new Date(),
          isActive: 1
        });
      
      const accountID = accountResult.insertId;
      
      // Create user entry
      const [userResult] = await fastify.db
        .insert(schema.users)
        .values({
          userName,
          isRegistered: 1,
          extID: accountID,
          lastPlayed: new Date()
        });
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error registering account:', error);
      return '-1';
    }
  });
  
  // Update account settings
  fastify.post('/database/updateGJAccSettings20.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const mS = parseInt(body.mS || '0'); // message settings
    const frS = parseInt(body.frS || '0'); // friend request settings
    const cS = parseInt(body.cS || '0'); // comment settings
    
    if (!accountID) {
      return '-1';
    }
    
    try {
      const [result] = await fastify.db
        .update(schema.accounts)
        .set({ mS, frS })
        .where(eq(schema.accounts.accountID, accountID));
      
      if (result.affectedRows === 0) {
        return '-1';
      }
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error updating account settings:', error);
      return '-1';
    }
  });
  
  // Backup account data
  fastify.post('/database/accounts/backupGJAccountNew.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    const saveData = body.saveData;
    const CCGameManager = body.CCGameManager;
    const CCLocalLevels = body.CCLocalLevels;
    
    if (!accountID || !saveData) {
      return '-1';
    }
    
    try {
      // Check if backup already exists
      const existing = await fastify.db
        .select()
        .from(schema.accountsaves)
        .where(eq(schema.accountsaves.accountID, accountID))
        .limit(1);
      
      if (existing.length) {
        // Update existing backup
        await fastify.db
          .update(schema.accountsaves)
          .set({
            saveData,
            CCGameManager,
            CCLocalLevels,
            timestamp: new Date()
          })
          .where(eq(schema.accountsaves.accountID, accountID));
      } else {
        // Create new backup
        await fastify.db
          .insert(schema.accountsaves)
          .values({
            accountID,
            saveData,
            CCGameManager,
            CCLocalLevels,
            timestamp: new Date()
          });
      }
      
      // Update user last played
      await fastify.db
        .update(schema.users)
        .set({ lastPlayed: new Date() })
        .where(eq(schema.users.extID, accountID));
      
      return '1';
      
    } catch (error) {
      fastify.log.error('Error backing up account:', error);
      return '-1';
    }
  });
  
  // Sync account data
  fastify.post('/database/accounts/syncGJAccountNew.php', async (request, reply) => {
    const body = request.body as any;
    const accountID = parseInt(body.accountID);
    
    if (!accountID) {
      return '-1';
    }
    
    try {
      // Get backup save data
      const backup = await fastify.db
        .select()
        .from(schema.accountsaves)
        .where(eq(schema.accountsaves.accountID, accountID))
        .limit(1);
      
      if (!backup.length) {
        return '-1'; // No backup found
      }
      
      const backupData = backup[0];
      
      // Return the saved data in the format GD expects
      const response = [
        backupData.saveData || '',
        backupData.CCGameManager || '',
        backupData.CCLocalLevels || ''
      ].join('|');
      
      return response;
      
    } catch (error) {
      fastify.log.error('Error syncing account:', error);
      return '-1';
    }
  });
}