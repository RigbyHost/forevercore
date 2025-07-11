import { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { schema } from '../../db/index.js';
import { generateGDHash } from '../../utils/crypto.js';

/**
 * Songs and SFX API endpoints - GD compatible
 */
export async function registerSongsRoutes(fastify: FastifyInstance) {
  
  // Get song info
  fastify.post('/database/getGJSongInfo.php', async (request, reply) => {
    const body = request.body as any;
    const songID = parseInt(body.songID);
    
    if (!songID) {
      return '-1';
    }
    
    try {
      const song = await fastify.db
        .select()
        .from(schema.songs)
        .where(eq(schema.songs.songID, songID))
        .limit(1);
      
      if (!song.length) {
        return '-1';
      }
      
      const songData = song[0];
      
      // Check if song is disabled
      if (songData.isDisabled) {
        return '-1';
      }
      
      // Format response in GD format
      const response = [
        `1:${songData.songID}`,
        `2:${songData.name || 'Unknown'}`,
        `3:${songData.authorID || 0}`,
        `4:${songData.authorName || 'Unknown'}`,
        `5:${songData.size || '0'}`,
        `6:`,  // empty field
        `7:`,  // empty field  
        `8:0`, // is verified original
        `10:${songData.download || ''}`
      ].join('~|~');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting song info:', error);
      return '-1';
    }
  });
  
  // Get top artists
  fastify.post('/database/getGJTopArtists.php', async (request, reply) => {
    const body = request.body as any;
    const page = parseInt(body.page || '0');
    const count = parseInt(body.count || '10');
    const offset = page * count;
    
    try {
      // Get top artists by song count
      const artists = await fastify.db
        .select({
          authorName: schema.songs.authorName,
          songCount: sql`COUNT(*)`.as('songCount')
        })
        .from(schema.songs)
        .where(eq(schema.songs.isDisabled, 0))
        .groupBy(schema.songs.authorName)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(count)
        .offset(offset);
      
      if (!artists.length) {
        return '-1';
      }
      
      const artistStrings = artists.map((artist, index) => {
        return [
          `1:${artist.authorName}`,
          `2:${artist.songCount}`,
          `3:${offset + index + 1}` // rank
        ].join(':');
      });
      
      const response = artistStrings.join('|');
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting top artists:', error);
      return '-1';
    }
  });
  
  // Get SFX info
  fastify.post('/database/getGJSFXInfo.php', async (request, reply) => {
    const body = request.body as any;
    const sfxID = parseInt(body.sfxID);
    
    if (!sfxID) {
      return '-1';
    }
    
    try {
      const sfx = await fastify.db
        .select()
        .from(schema.sfx)
        .where(eq(schema.sfx.sfxID, sfxID))
        .limit(1);
      
      if (!sfx.length) {
        return '-1';
      }
      
      const sfxData = sfx[0];
      
      // Format response in GD format
      const response = [
        `1:${sfxData.sfxID}`,
        `2:${sfxData.name || 'Unknown'}`,
        `3:${sfxData.authorName || 'Unknown'}`,
        `4:${sfxData.size || '0'}`,
        `5:${sfxData.download || ''}`
      ].join('~|~');
      
      return `${response}#${generateGDHash(response)}`;
      
    } catch (error) {
      fastify.log.error('Error getting SFX info:', error);
      return '-1';
    }
  });
  
  // Add custom song (for reupload)
  fastify.post('/database/addGJSong.php', async (request, reply) => {
    const body = request.body as any;
    const name = body.name;
    const authorName = body.author;
    const size = body.size;
    const download = body.url;
    
    if (!name || !authorName || !download) {
      return '-1';
    }
    
    try {
      // Check if song already exists by URL
      const existing = await fastify.db
        .select()
        .from(schema.songs)
        .where(eq(schema.songs.originalLink, download))
        .limit(1);
      
      if (existing.length) {
        return existing[0].songID.toString();
      }
      
      // Generate new song ID (start from 10000000 for custom songs)
      const [maxSong] = await fastify.db
        .select({ maxID: sql`MAX(songID)` })
        .from(schema.songs);
      
      const newSongID = Math.max(10000000, (maxSong.maxID || 0) + 1);
      
      // Insert new song
      await fastify.db
        .insert(schema.songs)
        .values({
          songID: newSongID,
          name,
          authorName,
          size: size || '0',
          download,
          originalLink: download,
          reuploadTime: new Date(),
          isDisabled: 0
        });
      
      return newSongID.toString();
      
    } catch (error) {
      fastify.log.error('Error adding song:', error);
      return '-1';
    }
  });
  
  // Add custom SFX
  fastify.post('/database/addGJSFX.php', async (request, reply) => {
    const body = request.body as any;
    const name = body.name;
    const authorName = body.author;
    const size = body.size;
    const download = body.url;
    
    if (!name || !authorName || !download) {
      return '-1';
    }
    
    try {
      // Generate new SFX ID (start from 1000000 for custom SFX)
      const [maxSfx] = await fastify.db
        .select({ maxID: sql`MAX(sfxID)` })
        .from(schema.sfx);
      
      const newSfxID = Math.max(1000000, (maxSfx.maxID || 0) + 1);
      
      // Insert new SFX
      await fastify.db
        .insert(schema.sfx)
        .values({
          sfxID: newSfxID,
          name,
          authorName,
          size: size || '0',
          download,
          reuploadTime: new Date()
        });
      
      return newSfxID.toString();
      
    } catch (error) {
      fastify.log.error('Error adding SFX:', error);
      return '-1';
    }
  });
}