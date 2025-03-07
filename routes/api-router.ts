'package net.fimastgd.forevercore.routes.api-router';

import express, { Request, Response, Router } from 'express';
import ConsoleApi from '../modules/console-api';

/**
 * ApiHandler interface for consistent API endpoint handling
 */
export interface ApiHandler {
    /**
     * Process the API request
     * @param req - Express request
     * @param res - Express response
     * @returns Promise resolving to handled result
     */
    handle(req: Request, res: Response): Promise<void>;

    /**
     * Get the API endpoint path
     * @returns API endpoint path
     */
    getPath(): string;

    /**
     * Get HTTP method (POST, GET, etc)
     * @returns HTTP method string
     */
    getMethod(): 'post' | 'get' | 'put' | 'delete';
}

/**
 * Base class for API handlers
 */
export abstract class BaseApiHandler implements ApiHandler {
    protected path: string;
    protected method: 'post' | 'get' | 'put' | 'delete';

    constructor(path: string, method: 'post' | 'get' | 'put' | 'delete' = 'post') {
        this.path = path;
        this.method = method;
    }

    /**
     * Process API request
     */
    abstract handle(req: Request, res: Response): Promise<void>;

    /**
     * Get handler API path
     */
    getPath(): string {
        return this.path;
    }

    /**
     * Get handler HTTP method
     */
    getMethod(): 'post' | 'get' | 'put' | 'delete' {
        return this.method;
    }
}

/**
 * API Router for registering and handling API endpoints
 */
export class ApiRouter {
    private router: Router;
    private handlers: ApiHandler[] = [];

    constructor() {
        this.router = express.Router();
    }

    /**
     * Register a new API handler
     * @param handler - API handler implementation
     * @returns This router instance for chaining
     */
    registerHandler(handler: ApiHandler): ApiRouter {
        this.handlers.push(handler);
        return this;
    }

    /**
     * Register multiple API handlers
     * @param handlers - Array of API handlers
     * @returns This router instance for chaining
     */
    registerHandlers(handlers: ApiHandler[]): ApiRouter {
        this.handlers.push(...handlers);
        return this;
    }

    /**
     * Configure and initialize routes
     * @returns Express router with configured routes
     */
    initialize(): Router {
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

            ConsoleApi.Debug('ApiRouter', `Registered route: ${method.toUpperCase()} ${path}`);
        }

        return this.router;
    }

    /**
     * Create a route handler function for Express
     * @param handler - API handler implementation
     * @returns Express route handler function
     */
    private createRouteHandler(handler: ApiHandler) {
        return async (req: Request, res: Response) => {
            try {
                await handler.handle(req, res);
            } catch (error) {
                ConsoleApi.Error('ApiRouter', `Error handling request to ${handler.getPath()}: ${error}`);
                res.status(500).send('-1');
            }
        };
    }
}

export default ApiRouter;