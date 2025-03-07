'package net.fimastgd.forevercore.api.accounts.login';

import { Connection, RowDataPacket } from 'mysql2/promise';
import GeneratePass from '../lib/generatePass';
import ApiLib from '../lib/apiLib';
import ExploitPatch from '../lib/exploitPatch';
import ConsoleApi from '../../modules/console-api';
import db from '../../serverconf/db';
import { Request } from 'express';

interface LoginResult {
    success: boolean;
    accountID?: number;
    userID?: number;
    message: string;
}

/**
 * Handles user login for Geometry Dash accounts
 * @param userNameOr - Username provided by user
 * @param udidOr - Unique device ID if provided
 * @param passwordOr - Password (if using standard auth)
 * @param gjp2Or - GJP2 hash (if using GJP2 auth)
 * @param req - Express request object
 * @returns Promise resolving to login result string
 */
const loginAccount = async (
    userNameOr: string | undefined,
    udidOr: string | undefined,
    passwordOr: string | undefined,
    gjp2Or: string | undefined,
    req: Request
): Promise<string> => {
    try {
        const ip = await ApiLib.getIP(req);
        const udid = udidOr ? await ExploitPatch.remove(udidOr) : '';
        const userName = userNameOr ? await ExploitPatch.remove(userNameOr) : '';

        // Check if username exists
        const [rows] = await db.execute<RowDataPacket[]>(
            "SELECT accountID FROM accounts WHERE userName LIKE ?",
            [userName]
        );

        if (rows.length === 0) {
            ConsoleApi.Log("main", `Failed login to account (Username is invalid): ${userName}`);
            return "-1";
        }

        const id = rows[0].accountID;

        // Validate credentials
        let pass = 0;
        if (passwordOr) {
            pass = await GeneratePass.isValidUsrname(userName, passwordOr, req);
        } else if (gjp2Or) {
            pass = await GeneratePass.isGJP2ValidUsrname(userName, gjp2Or, req);
        }

        if (pass === 1) {
            // Get user ID or create a new user
            const [userRows] = await db.execute<RowDataPacket[]>(
                "SELECT userID FROM users WHERE extID = ?",
                [id]
            );

            let userID: number;
            if (userRows.length > 0) {
                userID = userRows[0].userID;
            } else {
                const [result] = await db.execute<RowDataPacket[]>(
                    "INSERT INTO users (isRegistered, extID, userName) VALUES (1, ?, ?)",
                    [id, userName]
                );
                userID = (result as any).insertId;
            }

            // Log the login action
            await db.execute(
                "INSERT INTO actions (type, value, timestamp, value2) VALUES (?, ?, ?, ?)",
                ['2', userName, Math.floor(Date.now() / 1000), ip]
            );

            ConsoleApi.Log("main", `Logged to account: ${userName}`);

            // Handle UDID transfer if needed
            if (!isNaN(parseInt(udid))) {
                try {
                    const [oldUserRows] = await db.execute<RowDataPacket[]>(
                        "SELECT userID FROM users WHERE extID = ?",
                        [udid]
                    );

                    if (oldUserRows.length > 0) {
                        const oldUserID = oldUserRows[0].userID;
                        await db.execute(
                            "UPDATE levels SET userID = ?, extID = ? WHERE userID = ?",
                            [userID, id, oldUserID]
                        );
                    }
                } catch (error) {
                    ConsoleApi.Warn("main", `UDID transfer failed for ${userName}: ${error}`);
                }
            }

            return `${id},${userID}`;
        } else if (pass === -1) {
            ConsoleApi.Log("main", `Failed login to account (Invalid password): ${userName}`);
            return "-12";
        } else {
            ConsoleApi.Log("main", `Failed login to account (Failed to check pass): ${userName}`);
            return "-1";
        }
    } catch (error) {
        ConsoleApi.Warn("main", "Enabled emergency protection against account hacking at net.fimastgd.forevercore.api.accounts.login");
        ConsoleApi.FatalError("main", `Unhandled server exception with user login to account, automatic protection called at net.fimastgd.forevercore.api.accounts.login\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.login`);
        return "-1";
    }
};

export default loginAccount;