"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Gets the protocol (http or https) from the request
 * @param req - Express request
 * @returns Protocol string (http or https)
 */
const getAccountURL = async (req) => {
    return new Promise((resolve) => {
        const protocol = (req.secure || req.headers['x-forwarded-proto'] === 'https') ? 'https' : 'http';
        resolve(protocol);
    });
};
exports.default = getAccountURL;
