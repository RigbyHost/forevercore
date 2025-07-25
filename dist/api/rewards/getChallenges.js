"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
const apiLib_1 = __importDefault(require("../lib/apiLib"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
const api_1 = require("../../serverconf/api");
/**
 * Gets quests/challenges for a GD user
 * @param accountIDStr - Account ID
 * @param udidStr - Device ID
 * @param chkStr - Check string
 * @returns Challenge data from API
 */
const getChallenges = async (accountIDStr, udidStr, chkStr) => {
    try {
        // Process parameters
        const udid = await exploitPatch_1.default.remove(udidStr);
        const accountID = await exploitPatch_1.default.remove(accountIDStr);
        // Validate UDID
        if (!isNaN(Number(udid))) {
            return "-1";
        }
        const chk = await exploitPatch_1.default.remove(chkStr);
        // Get user ID
        let userID;
        if (accountID !== '0') {
            userID = await apiLib_1.default.getUserID(accountID);
        }
        else {
            userID = await apiLib_1.default.getUserID(udid);
        }
        // Get available quests
        const [rows] = await db_proxy_1.default.query("SELECT type, amount, reward, name FROM quests");
        // Get challenges from external API
        const url = api_1.apiURL.getChallenges;
        const params = {
            accountID: accountID,
            userID: userID,
            udid: udid,
            chk: chk,
            result: rows
        };
        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        const response = await axios_1.default.post(url, params, config);
        const API_RESPONSE = response.data;
        console_api_1.default.Log("main", "Received challenges from API");
        return API_RESPONSE;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.rewards.getChallenges`);
        return "-1";
    }
};
exports.default = getChallenges;
