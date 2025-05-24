import { Request, Response } from 'express';
import { BaseApiHandler } from '../api-router';
import getComments from '../../api/comments/getComments';
import uploadComment from '../../api/comments/uploadComment';
import deleteComment from '../../api/comments/deleteComment';
import getAccountComments from '../../api/comments/getAccountComments';
import uploadAccountComment from '../../api/comments/uploadAccountComment';
import deleteAccountComment from '../../api/comments/deleteAccountComment';
import ConsoleApi from '../../modules/console-api';

// Обработчики для комментариев к уровням
export class GetCommentsHandler extends BaseApiHandler {
    constructor() {
        super('/getGJComments21.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Comments', `Processing request for level comments, level ID: ${req.body.levelID}`);
            const result = await getComments(
                req.body.binaryVersion,
                req.body.gameVersion,
                req.body.mode,
                req.body.count,
                req.body.page,
                req.body.levelID,
                req.body.userID
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetCommentsHandler', `Error getting comments: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class UploadCommentHandler extends BaseApiHandler {
    constructor() {
        super('/uploadGJComment21.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Comments', `Processing request to upload comment to level ID: ${req.body.levelID}`);
            
            // Передаем параметры по одному, а не весь объект req
            const result = await uploadComment(
                req.body.userName,
                req.body.gameVersion,
                req.body.comment,
                req.body.levelID,
                req.body.percent,
                req.body.udid,
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req // Этот последний параметр должен быть объектом Request
            );
            
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('UploadCommentHandler', `Error uploading comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class DeleteCommentHandler extends BaseApiHandler {
    constructor() {
        super('/deleteGJComment20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Comments', `Processing request to delete comment ID: ${req.body.commentID}`);
            const result = await deleteComment(
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req.body.commentID,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('DeleteCommentHandler', `Error deleting comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}

// Обработчики для комментариев к аккаунтам
export class GetAccountCommentsHandler extends BaseApiHandler {
    constructor() {
        super('/getGJAccountComments20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Comments', `Processing request for account comments, account ID: ${req.body.accountID}`);
            const result = await getAccountComments(
                req.body.accountID,
                req.body.page,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('GetAccountCommentsHandler', `Error getting account comments: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class UploadAccountCommentHandler extends BaseApiHandler {
    constructor() {
        super('/uploadGJAccComment20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Comments', `Processing request to upload comment to account ID: ${req.body.accountID}`);
            const result = await uploadAccountComment(
                req.body.userName,
                req.body.accountID,
                req.body.comment,
                req.body.gjp,
                req.body.gjp2,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('UploadAccountCommentHandler', `Error uploading account comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export class DeleteAccountCommentHandler extends BaseApiHandler {
    constructor() {
        super('/deleteGJAccComment20.php');
    }

    async handle(req: Request, res: Response): Promise<void> {
        try {
            ConsoleApi.Log('Comments', `Processing request to delete account comment ID: ${req.body.commentID}`);
            const result = await deleteAccountComment(
                req.body.commentID,
                req.body.accountID,
                req.body.gjp2,
                req.body.gjp,
                req
            );
            res.status(200).send(result);
        } catch (error) {
            ConsoleApi.Error('DeleteAccountCommentHandler', `Error deleting account comment: ${error}`);
            res.status(200).send('-1');
        }
    }
}

export function createCommentHandlers() {
    return [
        new GetCommentsHandler(),
        new UploadCommentHandler(),
        new DeleteCommentHandler(),
        new GetAccountCommentsHandler(),
        new UploadAccountCommentHandler(),
        new DeleteAccountCommentHandler()
    ];
}