'package net.fimastgd.forevercore.api.communication.uploadMessage';

import { Request } from 'express';
import { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import db from '../../serverconf/db-proxy';
import ExploitPatch from '../lib/exploitPatch';
import ApiLib from '../lib/apiLib';
import GJPCheck from '../lib/GJPCheck';
import ConsoleApi from '../../modules/console-api';

/**
 * Upload a message to another user
 * @param gameVersionStr - Game version
 * @param binaryVersionStr - Binary version
 * @param secretStr - Secret token
 * @param subjectStr - Message subject
 * @param toAccountIDStr - Recipient account ID
 * @param bodyStr - Message body
 * @param accountIDStr - Sender account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "1" on success, "-1" on failure
 */
const uploadMessage = async (
	gameVersionStr?: string,
	binaryVersionStr?: string,
	secretStr?: string,
	subjectStr?: string,
	toAccountIDStr?: string,
	bodyStr?: string,
	accountIDStr?: string,
	gjp2Str?: string,
	gjpStr?: string,
	req?: Request
): Promise<string> => {
	try {
		// Process and validate input parameters
		const gameVersion = await ExploitPatch.remove(gameVersionStr);
		const binaryVersion = await ExploitPatch.remove(binaryVersionStr);
		const secret = await ExploitPatch.remove(secretStr);
		const subject = await ExploitPatch.remove(subjectStr);
		const toAccountID = await ExploitPatch.number(toAccountIDStr);
		const body = await ExploitPatch.remove(bodyStr);

		// Authenticate sender
		const accID = await GJPCheck.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);

		// Can't message yourself
		if (accID == toAccountID) {
			return "-1";
		}

		// Get sender's username
		const [userNameRows] = await db.query<RowDataPacket[]>(
			"SELECT userName FROM users WHERE extID = ? ORDER BY userName DESC",
			[accID]
		);

		const userName = userNameRows[0].userName;
		const id = await ExploitPatch.remove(accountIDStr);
		const userID = await ApiLib.getUserID(id);
		const uploadDate = Math.floor(Date.now() / 1000);

		// Check if sender is blocked by recipient
		const [blockedRows] = await db.query<RowDataPacket[]>(
			"SELECT ID FROM `blocks` WHERE person1 = ? AND person2 = ?",
			[toAccountID, accID]
		);

		// Check recipient's message settings
		const [mSOnlyRows] = await db.query<RowDataPacket[]>(
			"SELECT mS FROM `accounts` WHERE accountID = ? AND mS > 0",
			[toAccountID]
		);

		// Check if users are friends
		const [friendRows] = await db.query<RowDataPacket[]>(
			"SELECT ID FROM `friendships` WHERE (person1 = ? AND person2 = ?) OR (person2 = ? AND person1 = ?)",
			[accID, toAccountID, accID, toAccountID]
		);

		// Friends-only messages check
		if (mSOnlyRows.length > 0 && mSOnlyRows[0].mS == 2) {
			ConsoleApi.Warn("main",
				"Failed to upload message: mSOnlyRows length more '0' and mSOnlyRows[0].mS equal '2' " +
				"at net.fimastgd.forevercore.api.communication.uploadMessage"
			);
			return "-1";
		} else {
			// Verify message can be sent (not blocked, and respects message settings)
			if (blockedRows.length === 0 && (mSOnlyRows.length === 0 || friendRows.length > 0)) {
				// Insert message
				await db.query(
					"INSERT INTO messages (subject, body, accID, userID, userName, toAccountID, secret, timestamp) " +
					"VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
					[subject, body, id, userID, userName, toAccountID, secret, uploadDate]
				);

				return "1";
			} else {
				throw new Error('Failed to upload message: submission requirements not met');
			}
		}
	} catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.communication.uploadMessage`);
		return "-1";
	}
};

export default uploadMessage;