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
 * Accepts a friend request in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const acceptFriendRequest = async (req) => {
    try {
        // Check if request ID is provided
        if (!req.body.requestID) {
            console_api_1.default.Log("main", "Friend request not accept: requestID not found");
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const requestID = await exploitPatch_1.default.remove(req.body.requestID);
        // Get friend request details
        const [requests] = await db_proxy_1.default.query("SELECT accountID, toAccountID FROM friendreqs WHERE ID = ?", [requestID]);
        if (requests.length === 0) {
            console_api_1.default.Log("main", "Friend request not accept: requests.length equal '0'");
            return "-1";
        }
        const request = requests[0];
        const reqAccountID = request.accountID;
        const toAccountID = request.toAccountID;
        // Verify request is for current user and not from self
        if (toAccountID != accountID || reqAccountID == accountID) {
            console_api_1.default.Log("main", "Friend request not accept: toAccountID not equal accountID or reqAccountID equal accountID");
            return "-1";
        }
        // Create friendship and delete request
        await db_proxy_1.default.query("INSERT INTO friendships (person1, person2, isNew1, isNew2) VALUES (?, ?, 1, 1)", [reqAccountID, toAccountID]);
        await db_proxy_1.default.query("DELETE from friendreqs WHERE ID = ? LIMIT 1", [requestID]);
        console_api_1.default.Log("main", `Accept friend request ${requestID} to accountID: ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.acceptFriendRequest`);
        return "-1";
    }
};
exports.default = acceptFriendRequest;
