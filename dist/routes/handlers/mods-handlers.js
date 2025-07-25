"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestUserAccessHandler = void 0;
exports.createModsHandlers = createModsHandlers;
const api_router_1 = require("../api-router");
const requestUserAccess_1 = __importDefault(require("../../api/mods/requestUserAccess"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class RequestUserAccessHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/requestUserAccess.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, requestUserAccess_1.default)(req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('RequestUserAccessHandler', `Error requesting user access: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.RequestUserAccessHandler = RequestUserAccessHandler;
function createModsHandlers() {
    return [
        new RequestUserAccessHandler()
    ];
}
