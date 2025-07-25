"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadListHandler = exports.DeleteListHandler = void 0;
exports.createListHandlers = createListHandlers;
const api_router_1 = require("../api-router");
const deleteList_1 = __importDefault(require("../../api/packs/lists/deleteList"));
const uploadList_1 = __importDefault(require("../../api/packs/lists/uploadList"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class DeleteListHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/deleteGJList.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, deleteList_1.default)(req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DeleteListHandler', `Error deleting list: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DeleteListHandler = DeleteListHandler;
class UploadListHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/uploadGJList.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, uploadList_1.default)(req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UploadListHandler', `Error uploading list: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UploadListHandler = UploadListHandler;
function createListHandlers() {
    return [
        new DeleteListHandler(),
        new UploadListHandler()
    ];
}
