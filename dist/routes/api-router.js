'package net.fimastgd.forevercore.routes.api-router';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRouter = exports.BaseApiHandler = void 0;
const express_1 = __importDefault(require("express"));
const console_api_1 = __importDefault(require("../modules/console-api"));
/**
 * Base class for API handlers
 */
class BaseApiHandler {
    constructor(path, method = 'post') {
        this.path = path;
        this.method = method;
    }
    /**
     * Get handler API path
     */
    getPath() {
        return this.path;
    }
    /**
     * Get handler HTTP method
     */
    getMethod() {
        return this.method;
    }
}
exports.BaseApiHandler = BaseApiHandler;
/**
 * API Router for registering and handling API endpoints
 */
class ApiRouter {
    constructor() {
        this.handlers = [];
        this.router = express_1.default.Router();
    }
    /**
     * Register a new API handler
     * @param handler - API handler implementation
     * @returns This router instance for chaining
     */
    registerHandler(handler) {
        console_api_1.default.Debug('ApiRouter', `Registering handler for ${handler.getMethod().toUpperCase()} ${handler.getPath()}`);
        this.handlers.push(handler);
        return this;
    }
    /**
     * Register multiple API handlers
     * @param handlers - Array of API handlers
     * @returns This router instance for chaining
     */
    registerHandlers(handlers) {
        console_api_1.default.Log('ApiRouter', `Registering ${handlers.length} handlers`);
        // Добавим подробное логирование каждого обработчика в массиве
        for (const handler of handlers) {
            console_api_1.default.Debug('ApiRouter', `Registering handler for ${handler.getMethod().toUpperCase()} ${handler.getPath()}`);
        }
        this.handlers.push(...handlers);
        return this;
    }
    /**
     * Configure and initialize routes
     * @returns Express router with configured routes
     */
    initialize() {
        for (const handler of this.handlers) {
            const path = handler.getPath();
            const method = handler.getMethod();
            // Use the appropriate HTTP method based on handler
            switch (method) {
                case 'get':
                    this.router.get(path, this.createRouteHandler(handler));
                    break;
                case 'post':
                    this.router.post(path, this.createRouteHandler(handler));
                    break;
                case 'put':
                    this.router.put(path, this.createRouteHandler(handler));
                    break;
                case 'delete':
                    this.router.delete(path, this.createRouteHandler(handler));
                    break;
            }
            console_api_1.default.Debug('ApiRouter', `Registered route: ${method.toUpperCase()} ${path}`);
        }
        return this.router;
    }
    /**
     * Create a route handler function for Express
     * @param handler - API handler implementation
     * @returns Express route handler function
     */
    createRouteHandler(handler) {
        return async (req, res) => {
            try {
                await handler.handle(req, res);
            }
            catch (error) {
                console_api_1.default.Error('ApiRouter', `Error handling request to ${handler.getPath()}: ${error}`);
                res.status(500).send('-1');
            }
        };
    }
}
exports.ApiRouter = ApiRouter;
exports.default = ApiRouter;
