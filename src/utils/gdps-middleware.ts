import { FastifyRequest, FastifyReply } from 'fastify';
import { hostingSchema } from '../db/index.js';
import { eq } from 'drizzle-orm';

/**
 * Extract GDPS ID from request and validate
 */
export async function extractGdpsId(request: FastifyRequest): Promise<string | null> {
  // Try to get GDPS ID from different sources
  let gdpsId: string | undefined;
  
  // 1. From URL parameters (/:gdpsid/panel/*)
  const params = request.params as any;
  if (params.gdpsid) {
    gdpsId = params.gdpsid;
  }
  
  // 2. From subdomain (gdpsid.domain.com)
  if (!gdpsId) {
    const host = request.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        gdpsId = subdomain;
      }
    }
  }
  
  // 3. From query parameter
  if (!gdpsId) {
    const query = request.query as any;
    if (query.gdps) {
      gdpsId = query.gdps;
    }
  }
  
  // 4. Default fallback for main instance
  if (!gdpsId) {
    gdpsId = 'main';
  }
  
  return gdpsId;
}

/**
 * Middleware to validate GDPS exists and is active
 */
export async function validateGdps(request: FastifyRequest, reply: FastifyReply) {
  const gdpsId = await extractGdpsId(request);
  
  if (!gdpsId) {
    reply.status(400).send({ error: 'GDPS ID not found' });
    return;
  }
  
  try {
    // Check if GDPS exists and is active
    const gdps = await request.server.hostingDb
      .select()
      .from(hostingSchema.gdpsInstances)
      .where(eq(hostingSchema.gdpsInstances.id, gdpsId))
      .limit(1);
    
    if (!gdps.length) {
      reply.status(404).send({ error: 'GDPS not found' });
      return;
    }
    
    const gdpsData = gdps[0];
    
    if (gdpsData.status !== 'active') {
      reply.status(403).send({ error: 'GDPS is not active' });
      return;
    }
    
    // Add GDPS info to request context
    (request as any).gdps = {
      id: gdpsId,
      data: gdpsData,
      db: request.server.getGdpsDb(gdpsId)
    };
    
  } catch (error) {
    request.server.log.error('Error validating GDPS:', error);
    reply.status(500).send({ error: 'Internal server error' });
  }
}

/**
 * Get GDPS database for current request
 */
export function getRequestGdpsDb(request: FastifyRequest) {
  const context = (request as any).gdps;
  return context?.db || null;
}

/**
 * Get GDPS ID for current request
 */
export function getRequestGdpsId(request: FastifyRequest): string | null {
  const context = (request as any).gdps;
  return context?.id || null;
}

/**
 * Get GDPS data for current request
 */
export function getRequestGdpsData(request: FastifyRequest) {
  const context = (request as any).gdps;
  return context?.data || null;
}