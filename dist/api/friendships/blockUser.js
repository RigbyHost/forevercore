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
 * Blocks a user in Geometry Dash
 * @param req - Express request with required parameters
 * @returns "1" if successful, "-1" if failed
 */
const blockUser = async (req) => {
    try {
        // Check if target account ID is provided
        if (!req.body.targetAccountID) {
            console_api_1.default.Log("main", "User not blocked: req.body.targetAccountID not found");
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const targetAccountID = await exploitPatch_1.default.remove(req.body.targetAccountID);
        // Prevent self-blocking
        if (accountID == targetAccountID) {
            console_api_1.default.Log("main", `User ${targetAccountID} not blocked by ${accountID}: accountID equal targetAccountID`);
            return "-1";
        }
        // Create block record
        const [result] = await db_proxy_1.default.execute("INSERT INTO blocks (person1, person2) VALUES (?, ?)", [accountID, targetAccountID]);
        console_api_1.default.Log("main", `User ${targetAccountID} blocked by ${accountID}`);
        return "1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.blockUser`);
        return "-1";
    }
};
exports.default = blockUser;
