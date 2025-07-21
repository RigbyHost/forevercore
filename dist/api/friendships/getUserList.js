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
 * Gets list of friends or blocked users for a GD user
 * @param req - Express request with required parameters
 * @returns Formatted user list string, "-1" if error, "-2" if no users
 */
const getUserList = async (req) => {
    try {
        // Validate required parameters
        if (!req.body.type || isNaN(Number(req.body.type))) {
            console_api_1.default.Log("main", "Failed to get user list: req.body.type not a number or not defined");
            return "-1";
        }
        // Authenticate user
        const accountID = await GJPCheck_1.default.getAccountIDOrDie(req.body.accountID, req.body.gjp2, req.body.gjp, req);
        const type = parseInt(exploitPatch_1.default.remove(req.body.type));
        let people = "";
        let peoplestring = "";
        const newMap = new Map();
        // Determine query based on list type
        let query;
        if (type === 0) {
            // Friends list
            query = "SELECT person1, isNew1, person2, isNew2 FROM friendships WHERE person1 = ? OR person2 = ?";
        }
        else if (type === 1) {
            // Blocked users list
            query = "SELECT person1, person2 FROM blocks WHERE person1 = ?";
        }
        else {
            return "-1";
        }
        // Execute query
        const [result] = await db_proxy_1.default.query(query, type == 0 ? [accountID, accountID] : [accountID]);
        if (result.length === 0) {
            console_api_1.default.Log("main", `User list is empty. accountID: ${accountID}`);
            return "-2";
        }
        // Process results
        for (const friendship of result) {
            let person = friendship.person1;
            let isnew = friendship.isNew1;
            if (friendship.person1 == accountID) {
                person = friendship.person2;
                isnew = friendship.isNew2;
            }
            newMap.set(person, isnew);
            people += person + ",";
        }
        people = people.slice(0, -1);
        // Get user data for each person
        const [users] = await db_proxy_1.default.query("SELECT userName, userID, icon, color1, color2, iconType, special, extID FROM users WHERE extID IN (?) ORDER BY userName ASC", [people.split(",")]);
        // Format user data
        for (const user of users) {
            user.extID = !isNaN(Number(user.extID)) ? user.extID : 0;
            peoplestring += `1:${user.userName}:2:${user.userID}:9:${user.icon}:10:${user.color1}:11:${user.color2}:14:${user.iconType}:15:${user.special}:16:${user.extID}:18:0:41:${newMap.get(user.extID)}|`;
        }
        // Remove trailing pipe
        peoplestring = peoplestring.slice(0, -1);
        // Mark all "new" notifications as read
        await db_proxy_1.default.query("UPDATE friendships SET isNew1 = '0' WHERE person2 = ?", [accountID]);
        await db_proxy_1.default.query("UPDATE friendships SET isNew2 = '0' WHERE person1 = ?", [accountID]);
        if (peoplestring == "") {
            console_api_1.default.Log("main", `Failed to get user list: peoplestring is empty. accountID: ${accountID}`);
            return "-1";
        }
        console_api_1.default.Log("main", `Received user list. accountID: ${accountID}`);
        return peoplestring;
    }
    catch (error) {
        console_api_1.default.Error("main", `${error} at net.fimastgd.forevercore.api.friendships.getUserList`);
        return "-1";
    }
};
exports.default = getUserList;
