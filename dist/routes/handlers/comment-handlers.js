"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAccountCommentHandler = exports.UploadAccountCommentHandler = exports.GetAccountCommentsHandler = exports.DeleteCommentHandler = exports.UploadCommentHandler = exports.GetCommentsHandler = void 0;
exports.createCommentHandlers = createCommentHandlers;
const api_router_1 = require("../api-router");
const getComments_1 = __importDefault(require("../../api/comments/getComments"));
const uploadComment_1 = __importDefault(require("../../api/comments/uploadComment"));
const deleteComment_1 = __importDefault(require("../../api/comments/deleteComment"));
const getAccountComments_1 = __importDefault(require("../../api/comments/getAccountComments"));
const uploadAccountComment_1 = __importDefault(require("../../api/comments/uploadAccountComment"));
const deleteAccountComment_1 = __importDefault(require("../../api/comments/deleteAccountComment"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
// Обработчики для комментариев к уровням
class GetCommentsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJComments21.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Comments', `Processing request for level comments, level ID: ${req.body.levelID}`);
            const result = await (0, getComments_1.default)(req.body.binaryVersion, req.body.gameVersion, req.body.mode, req.body.count, req.body.page, req.body.levelID, req.body.userID);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetCommentsHandler', `Error getting comments: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetCommentsHandler = GetCommentsHandler;
class UploadCommentHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/uploadGJComment21.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Comments', `Processing request to upload comment to level ID: ${req.body.levelID}`);
            // Передаем параметры по одному, а не весь объект req
            const result = await (0, uploadComment_1.default)(req.body.userName, req.body.gameVersion, req.body.comment, req.body.levelID, req.body.percent, req.body.udid, req.body.accountID, req.body.gjp2, req.body.gjp, req // Этот последний параметр должен быть объектом Request
            );
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UploadCommentHandler', `Error uploading comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UploadCommentHandler = UploadCommentHandler;
class DeleteCommentHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/deleteGJComment20.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Comments', `Processing request to delete comment ID: ${req.body.commentID}`);
            const result = await (0, deleteComment_1.default)(req.body.accountID, req.body.gjp2, req.body.gjp, req.body.commentID, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DeleteCommentHandler', `Error deleting comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DeleteCommentHandler = DeleteCommentHandler;
// Обработчики для комментариев к аккаунтам
class GetAccountCommentsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJAccountComments20.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Comments', `Processing request for account comments, account ID: ${req.body.accountID}`);
            const result = await (0, getAccountComments_1.default)(req.body.accountID, req.body.page, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetAccountCommentsHandler', `Error getting account comments: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetAccountCommentsHandler = GetAccountCommentsHandler;
class UploadAccountCommentHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/uploadGJAccComment20.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Comments', `Processing request to upload comment to account ID: ${req.body.accountID}`);
            const result = await (0, uploadAccountComment_1.default)(req.body.userName, req.body.accountID, req.body.comment, req.body.gjp, req.body.gjp2, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('UploadAccountCommentHandler', `Error uploading account comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.UploadAccountCommentHandler = UploadAccountCommentHandler;
class DeleteAccountCommentHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/deleteGJAccComment20.php');
    }
    async handle(req, res) {
        try {
            console_api_1.default.Log('Comments', `Processing request to delete account comment ID: ${req.body.commentID}`);
            const result = await (0, deleteAccountComment_1.default)(req.body.commentID, req.body.accountID, req.body.gjp2, req.body.gjp, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('DeleteAccountCommentHandler', `Error deleting account comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.DeleteAccountCommentHandler = DeleteAccountCommentHandler;
function createCommentHandlers() {
    return [
        new GetCommentsHandler(),
        new UploadCommentHandler(),
        new DeleteCommentHandler(),
        new GetAccountCommentsHandler(),
        new UploadAccountCommentHandler(),
        new DeleteAccountCommentHandler()
    ];
}
