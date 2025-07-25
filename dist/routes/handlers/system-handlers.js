"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateCPsHandler = void 0;
exports.createSystemHandlers = createSystemHandlers;
const api_router_1 = require("../api-router");
const calculateCPs_1 = require("../../api/system/calculateCPs");
const console_api_1 = __importDefault(require("../../modules/console-api"));
class CalculateCPsHandler extends api_router_1.BaseApiHandler {
    constructor() {
        super('/calculateCPs.php');
    }
    async handle(req, res) {
        try {
            const result = await (0, calculateCPs_1.calculate)();
            res.status(200).send(result);
        }
        catch (error) {
            console_api_1.default.Error('CalculateCPsHandler', `Error calculating creator points: ${error}`);
            res.status(200).send('-1');
        }
    }
}
exports.CalculateCPsHandler = CalculateCPsHandler;
function createSystemHandlers() {
    return [
        new CalculateCPsHandler()
    ];
}
