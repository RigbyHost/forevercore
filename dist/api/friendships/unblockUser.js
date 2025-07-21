"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Unblocks a user in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const unblockUser = async (req) => {
    try {
        // Check if target account ID is provided
        if (!req.body.targetAccountID) {
            console_api_1.default.Log("main", "Failed to unblock user: targetAccountID not found");
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const targetAccountID = await exploitPatch_1.default.remove(req.body.targetAccountID);
        // Delete block record
        const query = "DELETE FROM blocks WHERE person1 = ? AND person2 = ?";
        await db_proxy_1.default.execute(query, [accountID, targetAccountID]);
        console_api_1.default.Log("main", `User ${targetAccountID} unblocked by ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.unblockUser`);
        return "-1";
    }
};
exports.default = unblockUser;
