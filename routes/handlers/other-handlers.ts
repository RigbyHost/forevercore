import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import getSongInfo from '../../api/other/getSongInfo';
import likeItem from '../../api/other/likeItem';
import topArtists from '../../api/other/topArtists';
import ConsoleApi from '../../modules/console-api';

export class GetSongInfoHandler extends BaseApiHandler {
    constructor() {
        super('/getGJSongInfo.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await getSongInfo(req.body.songID);
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetSongInfoHandler', `Error getting song info: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class LikeItemHandler extends BaseApiHandler {
    constructor() {
        super('/likeGJItem.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await likeItem(
                req.body.itemType,
                req.body.like,
                req.body.itemID,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('LikeItemHandler', `Error liking item: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class TopArtistsHandler extends BaseApiHandler {
    constructor() {
        super('/getGJTopArtists.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            const result = await topArtists(req.body.page);
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('TopArtistsHandler', `Error getting top artists: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export function createOtherHandlers() {
    return [
        new GetSongInfoHandler(),
        new LikeItemHandler(),
        new TopArtistsHandler()
    ];
}