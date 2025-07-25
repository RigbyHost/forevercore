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
 * Marks a friend request as read in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const readFriendRequest = async (req) => {
    try {
        // Check if request ID is provided
        if (!req.body.requestID) {
            console_api_1.default.Log("main", "Failed to read friend request: req.body.requestID not found");
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const requestID = await exploitPatch_1.default.remove(req.body.requestID);
        // Mark request as read
        const [result] = await db_proxy_1.default.execute("UPDATE friendreqs SET isNew='0' WHERE ID = ? AND toAccountID = ?", [requestID, accountID]);
        console_api_1.default.Log("main", `Read friend request ${requestID}. accountID: ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.readFriendRequest`);
        return "-1";
    }
};
exports.default = readFriendRequest;
