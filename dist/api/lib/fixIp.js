"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility class for handling IP addresses
 */
class FixIp {
    /**
     * Gets the client IP address from request
     * @param req - Express request
     * @returns Client IP address
     */
    static getIP(req) {
        if (!req || !req.headers) {
            return `ERROR WITH IP() HEADERS!!!`;
        }
        const forwarded = req.headers["x-forwarded-for"];
        return forwarded ? forwarded.split(",")[0] : req.socket?.remoteAddress || '';
    }
}
exports.default = FixIp;
