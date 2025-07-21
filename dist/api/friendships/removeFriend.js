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
 * Removes a friend in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const removeFriend = async (req) => {
    try {
        // Check if target account ID is provided
        if (!req.body.targetAccountID) {
            console_api_1.default.Log("main", "Failed to remove friend: req.body.targetAccountID not found");
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const targetAccountID = await exploitPatch_1.default.remove(req.body.targetAccountID);
        // Delete friendship in both directions
        const query1 = "DELETE FROM friendships WHERE person1 = ? AND person2 = ?";
        const query2 = "DELETE FROM friendships WHERE person2 = ? AND person1 = ?";
        await db_proxy_1.default.execute(query1, [accountID, targetAccountID]);
        await db_proxy_1.default.execute(query2, [accountID, targetAccountID]);
        console_api_1.default.Log("main", `Friend ${targetAccountID} removed by ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.removeFriend`);
        return "-1";
    }
};
exports.default = removeFriend;
