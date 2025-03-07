'package net.fimastgd.forevercore.api.rewards.getChallenges';

const ExploitPatch = require("../lib/exploitPatch");
const db = require("../../serverconf/db");
const ApiLib = require("../lib/apiLib");
const XORCipher = require("../lib/XORCipher");
const GenerateHash = require("../lib/generateHash");
const c = require("ansi-colors");
const apiURL = require("../../serverconf/api");

const axios = require("axios");
const ConsoleApi = require("../../modules/console-api");

const getChallenges = async (accountIDStr, udidStr, chkStr) => {
    function dateNow() {
        const currentDate = new Date();
        const fDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, "0")}:${currentDate.getMinutes().toString().padStart(2, "0")}`;
        return fDate;
    }
    try {
        const udid = await ExploitPatch.remove(udidStr);
        const accountID = await ExploitPatch.remove(accountIDStr);
        if (!isNaN(udid)) {
            return "-1";
        }
        const chk = await ExploitPatch.remove(chkStr);
        let userID;
        if (accountID != 0) {
            userID = await ApiLib.getUserID(accountID);
        } else {
            userID = await ApiLib.getUserID(udid);
        }
        const [rows] = await db.query("SELECT type, amount, reward, name FROM quests");
        
        // read more in config/api.js
        const url = apiURL.getChallenges;
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
        const response = await axios.post(url, params, config);
        // cretits: GMDPrivateServer by Cvolton
        const API_RESPONSE = response.data;
		ConsoleApi.Log("main", "Received challenges from API");       
        return API_RESPONSE;
    } catch (error) {
		ConsoleApi.Error("main", `${error} at net.fimastgd.forevercore.api.rewards.getChallenges`);
        return "-1";
    }
};

module.exports = getChallenges;
