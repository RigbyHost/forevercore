import { Request } from 'express';

/**
 * Utility class for handling IP addresses
 */
class FixIp {
  /**
   * Gets the client IP address from request
   * @param req - Express request
   * @returns Client IP address
   */
  static getIP(req: Request): string {
    if (!req || !req.headers) {
      return `ERROR WITH IP() HEADERS!!!`;
    }
    
    const forwarded = req.headers["x-forwarded-for"] as string | undefined;
    return forwarded ? forwarded.split(",")[0] : req.socket?.remoteAddress || '';
  }
}

export default FixIp;