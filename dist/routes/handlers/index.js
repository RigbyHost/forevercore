"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllHandlers = createAllHandlers;
const account_handlers_1 = require("./account-handlers");
const message_handlers_1 = require("./message-handlers");
const level_handlers_1 = require("./level-handlers");
const list_handlers_1 = require("./list-handlers");
const mods_handlers_1 = require("./mods-handlers");
const other_handlers_1 = require("./other-handlers");
const packs_handlers_1 = require("./packs-handlers");
const rewards_handlers_1 = require("./rewards-handlers");
const score_handlers_1 = require("./score-handlers");
const system_handlers_1 = require("./system-handlers");
const comment_handlers_1 = require("./comment-handlers");
function createAllHandlers() {
    return [
        ...(0, account_handlers_1.createAccountHandlers)(),
        ...(0, message_handlers_1.createCommunicationHandlers)(),
        ...(0, level_handlers_1.createLevelHandlers)(),
        ...(0, list_handlers_1.createListHandlers)(),
        ...(0, mods_handlers_1.createModsHandlers)(),
        ...(0, other_handlers_1.createOtherHandlers)(),
        ...(0, packs_handlers_1.createPacksHandlers)(),
        ...(0, rewards_handlers_1.createRewardsHandlers)(),
        ...(0, score_handlers_1.createScoresHandlers)(),
        ...(0, system_handlers_1.createSystemHandlers)(),
        ...(0, comment_handlers_1.createCommentHandlers)()
    ];
}
