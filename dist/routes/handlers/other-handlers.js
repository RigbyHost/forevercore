"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopArtistsHandler = exports.LikeItemHandler = exports.GetSongInfoHandler = void 0;
exports.createOtherHandlers = createOtherHandlers;
const api_router_1 = require("../api-router");
const getSongInfo_1 = __importDefault(require("../../api/other/getSongInfo"));
const likeItem_1 = __importDefault(require("../../api/other/likeItem"));
const topArtists_1 = __importDefault(require("../../api/other/topArtists"));
const console_api_1 = __importDefault(require("../../modules/console-api"));
class GetSongInfoHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJSongInfo.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, getSongInfo_1.default)(req.body.songID);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('GetSongInfoHandler', `Error getting song info: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.GetSongInfoHandler = GetSongInfoHandler;
class LikeItemHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/likeGJItem.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, likeItem_1.default)(req.body.itemType, req.body.like, req.body.itemID, req);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('LikeItemHandler', `Error liking item: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.LikeItemHandler = LikeItemHandler;
class TopArtistsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/getGJTopArtists.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, topArtists_1.default)(req.body.page);
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('TopArtistsHandler', `Error getting top artists: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.TopArtistsHandler = TopArtistsHandler;
function createOtherHandlers() {
    return [
        new GetSongInfoHandler(),
        new LikeItemHandler(),
        new TopArtistsHandler()
    ];
}
