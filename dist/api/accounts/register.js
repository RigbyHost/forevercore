"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exploitPatch_1 = __importDefault(require("../lib/exploitPatch"));
const generatePass_1 = __importDefault(require("../lib/generatePass"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../../serverconf/db"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
/**
 * Register a new Geometry Dash account
 * @param userNameStr - Username
 * @param passwordStr - Password
 * @param emailStr - Email address
 * @returns "1" if successful, "-2" if username exists, "-4" if username too long, "-1" for other errors
 */
const registerAccount = async (gdpsid, userNameStr, passwordStr, emailStr) => {
    const db = await (0, db_1.default)(gdpsid);
    try {
        if (!userNameStr || userNameStr === "") {
            return "-1";
        }
        const userName = await exploitPatch_1.default.remove(userNameStr);
        const password = await exploitPatch_1.default.remove(passwordStr);
        const email = await exploitPatch_1.default.remove(emailStr);
        // Check username length
        if (userName.length > 20) {
            console_api_1.default.Log("main", `Failed to register a new account: ${userName} - username too long`);
            return "-4";
        }
        // Check if username exists
        const query2 = "SELECT count(*) FROM accounts WHERE userName LIKE ?";
        const [rows] = await db.execute(query2, [userName]);
        const regusrs = rows[0]["count(*)"];
        if (regusrs > 0) {
            console_api_1.default.Log("main", `Failed to register a new account: ${userName} - account already exists`);
            return "-2";
        }
        else {
            // Hash password
            const hashpass = await bcryptjs_1.default.hash(password, 10);
            const gjp2 = await generatePass_1.default.GJP2hash(password);
            const registerDate = Math.floor(Date.now() / 1000);
            // Create account
            const query = "INSERT INTO accounts (userName, password, email, registerDate, isActive, gjp2) VALUES (?, ?, ?, ?, ?, ?)";
            await db.execute(query, [userName, hashpass, email, registerDate, 0, gjp2]);
            console_api_1.default.Log("main", `New account registered: ${userName}`);
            return "1";
        }
    }
    catch (error) {
        console_api_1.default.Warn("main", "Enabled emergency protection against account hacking at net.fimastgd.forevercore.api.accounts.register");
        console_api_1.default.FatalError("main", `Unhandled server exception with user register a new account, automatic protection called at net.fimastgd.forevercore.api.accounts.register\nJSException: ${error} at net.fimastgd.forevercore.api.accounts.register`);
        return "-1";
    }
};
exports.default = registerAccount;
