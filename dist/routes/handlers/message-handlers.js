"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadMessageHandler = exports.GetMessagesHandler = exports.DownloadMessageHandler = exports.DeleteMessagesHandler = void 0;
exports.createCommunicationHandlers = createCommunicationHandlers;
const api_router_1 = require("../api-router");
const deleteMessages_1 = __importDefault(require("../../api/communication/deleteMessages"));
const downloadMessage_1 = __importDefault(require("../../api/communication/downloadMessage"));
const getMessages_1 = __importDefault(require("../../api/communication/getMessages"));
const uploadMessage_1 = __importDefault(require("../../api/communication/uploadMessage"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class DeleteMessagesHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/deleteGJMessages20.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, deleteMessages_1.default)(req.body.messageID, req.body.messages, req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DeleteMessagesHandler', `Error deleting messages: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DeleteMessagesHandler = DeleteMessagesHandler;
class DownloadMessageHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/downloadGJMessage20.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, downloadMessage_1.default)(req.body.messageID, req.body.accountID, req.body.gjp2, req.body.gjp, req.body.isSender, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DownloadMessageHandler', `Error downloading message: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DownloadMessageHandler = DownloadMessageHandler;
class GetMessagesHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJMessages20.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getMessages_1.default)(req.body.page, req.body.getSent, req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetMessagesHandler', `Error getting messages: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetMessagesHandler = GetMessagesHandler;
class UploadMessageHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/uploadGJMessage20.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, uploadMessage_1.default)(req.body.gameVersion, req.body.binaryVersion, req.body.secret, req.body.subject, req.body.toAccountID, req.body.body, req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UploadMessageHandler', `Error uploading message: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UploadMessageHandler = UploadMessageHandler;
function createCommunicationHandlers() {
    return [
        new DeleteMessagesHandler(),
        new DownloadMessageHandler(),
        new GetMessagesHandler(),
        new UploadMessageHandler()
    ];
}
