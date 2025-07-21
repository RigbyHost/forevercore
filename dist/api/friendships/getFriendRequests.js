'package net.fimastgd.forevercore.api.friendships.getFriendRequests';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Gets friend requests for a GD user
 * @param req - Express request with required parameters
 * @returns Formatted friend requests string, "-1" if failed, "-2" if no requests
 */
const getFriendRequests = async (req) => {
    try {
        let reqstring = "";
        // Process parameters
        const getSent = !parseInt(req.body.getSent) ? 0 : await parseInt(exploitPatch_1.default.remove(req.body.getSent));
        const bcgjp = req.body.gameVersion > 21 ? req.body.gjp2 : req.body.gjp; // Backwards Compatible GJP
        if (!req.body.accountID || !req.body.page || isNaN(Number(req.body.page)) || !bcgjp) {
            console_api_1.default.Debug("main", "Friend requests error: POST params not found ");
            return "-1";
        }
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const page = await exploitPatch_1.default.number(req.body.page);
        const offset = parseInt(page) * 10;
        // Determine query based on request type
        let query, countquery;
        if (getSent == 0) {
            query = "SELECT accountID, toAccountID, uploadDate, ID, comment, isNew FROM friendreqs WHERE toAccountID = ? LIMIT 10 OFFSET ?";
            countquery = "SELECT count(*) as count FROM friendreqs WHERE toAccountID = ?";
        }
        else if (getSent == 1) {
            query = "SELECT * FROM friendreqs WHERE accountID = ? LIMIT 10 OFFSET ?";
            countquery = "SELECT count(*) as count FROM friendreqs WHERE accountID = ?";
        }
        else {
            console_api_1.default.Log("main", "Friend requests not received: getSent not equal '0' or '1'");
            return "-1";
        }
        // Execute queries
        const [result] = await db_proxy_1.default.query(query, [accountID, offset]);
        const [countResult] = await db_proxy_1.default.query(countquery, [accountID]);
        const reqcount = countResult[0].count;
        if (reqcount == 0) {
            console_api_1.default.Log("main", "Friend request not received: reqcount is 0");
            return "-2";
        }
        // Process each request
        for (const request of result) {
            const requester = getSent == 0 ? request.accountID : request.toAccountID;
            const [userResult] = await db_proxy_1.default.query("SELECT userName, userID, icon, color1, color2, iconType, special, extID FROM users WHERE extID = ?", [requester]);
            const user = userResult[0];
            // Format upload date
            const uploadTime = new Date(request.uploadDate * 1000)
                .toLocaleString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
                .replace(",", "")
                .replace(/:/g, ".");
            const extid = !isNaN(Number(user.extID)) ? user.extID : 0;
            // Build request string
            reqstring += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${extid}:32:${request.ID}:35:${request.comment}:41:${request.isNew}:37:${uploadTime}|`;
        }
        // Remove trailing pipe and add metadata
        reqstring = reqstring.slice(0, -1);
        console_api_1.default.Log("main", `Received friend requests`);
        return `${reqstring}#${reqcount}:${offset}:10`;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.getFriendRequests`);
        return "-1";
    }
};
exports.default = getFriendRequests;
