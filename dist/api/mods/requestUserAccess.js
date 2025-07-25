"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const GJPCheck_1 = __importDefault(require("../lib/GJPCheck"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Requests moderator access for a GD user
 * @param accountIDStr - Account ID
 * @param gjp2Str - GJP2 hash
 * @param gjpStr - GJP hash
 * @param req - Express request
 * @returns "2" for Elder Moderator, "1" for Moderator, "-1" if failed
 */
const requestUserAccess = async (accountIDStr, gjp2Str, gjpStr, req) => {
    try {
        let permState;
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(accountIDStr, gjp2Str, gjpStr, req);
        // Check mod permissions
        const requestModPerm = await apiLib_1.default.getMaxValuePermission(accountID, "actionRequestMod");
        if (typeof requestModPerm === 'number' && requestModPerm >= 1) {
            permState = await apiLib_1.default.getMaxValuePermission(accountID, "modBadgeLevel");
            // Return access level based on badge level
            if (typeof permState === 'number' && permState >= 2) {
                console_api_1.default.Log("main", `Elder Moderator or else granted to accountID: ${accountID}`);
                return "2";
            }
            console_api_1.default.Log("main", `Moderator or else granted to accountID: ${accountID}`);
            return "1";
        }
        return "-1";
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.mods.requestUserAccess`);
        return "-1";
    }
};
exports.default = requestUserAccess;
