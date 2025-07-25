'package net.fimastgd.forevercore.api.friendships.deleteFriendRequests';
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
 * Deletes a friend request in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const deleteFriendRequests = async (req) => {
    try {
        if (!req.body.targetAccountID) {
            console_api_1.default.Log("main", "Friend request not deleted: req.body.targetAccountID not found");
            return "-1";
        }
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const targetAccountID = await exploitPatch_1.default.remove(req.body.targetAccountID);
        let query;
        if (req.body.isSender && req.body.isSender == 1) {
            query = "DELETE from friendreqs WHERE accountID = ? AND toAccountID = ? LIMIT 1";
        }
        else {
            query = "DELETE from friendreqs WHERE toAccountID = ? AND accountID = ? LIMIT 1";
        }
        await db_proxy_1.default.execute(query, [accountID, targetAccountID]);
        console_api_1.default.Log("main", `Friend request from accountID ${targetAccountID} deleted by ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.deleteFriendRequests`);
        return "-1";
    }
};
exports.default = deleteFriendRequests;
