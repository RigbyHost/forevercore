import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import getComments from "../../api/comments/getComments";
import uploadComment from "../../api/comments/uploadComment";
import deleteComment from "../../api/comments/deleteComment";
import getAccountComments from "../../api/comments/getAccountComments";
import uploadAccountComment from "../../api/comments/uploadAccountComment";
import deleteAccountComment from "../../api/comments/deleteAccountComment";
import ConsoleApi from "../../modules/console-api";

// Обработчики для комментариев к уровням
export class GetCommentsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJComments.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request for level comments, level ID: ${req.body.levelID}`);
			const result = await getComments(
				gdpsid,
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
			ConsoleApi.Error("GetCommentsHandler", `Error getting comments: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetComments19Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJComments19.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request for level comments (v19), level ID: ${req.body.levelID}`);
			const result = await getComments(
				gdpsid,
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
			ConsoleApi.Error("GetComments19Handler", `Error getting comments: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetComments20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJComments20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request for level comments (v20), level ID: ${req.body.levelID}`);
			const result = await getComments(
				gdpsid,
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
			ConsoleApi.Error("GetComments20Handler", `Error getting comments: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class GetComments21Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJComments21.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request for level comments (v21), level ID: ${req.body.levelID}`);
			const result = await getComments(
				gdpsid,
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
			ConsoleApi.Error("GetComments21Handler", `Error getting comments: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadCommentHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJComment.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to upload comment to level ID: ${req.body.levelID}`);

			const result = await uploadComment(
				gdpsid,
				req.body.userName,
				req.body.gameVersion,
				req.body.comment,
				req.body.levelID,
				req.body.percent,
				req.body.udid,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadCommentHandler", `Error uploading comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadComment19Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJComment19.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to upload comment (v19) to level ID: ${req.body.levelID}`);

			const result = await uploadComment(
				gdpsid,
				req.body.userName,
				req.body.gameVersion,
				req.body.comment,
				req.body.levelID,
				req.body.percent,
				req.body.udid,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadComment19Handler", `Error uploading comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadComment20Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJComment20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to upload comment (v20) to level ID: ${req.body.levelID}`);

			const result = await uploadComment(
				gdpsid,
				req.body.userName,
				req.body.gameVersion,
				req.body.comment,
				req.body.levelID,
				req.body.percent,
				req.body.udid,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadComment20Handler", `Error uploading comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadComment21Handler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJComment21.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to upload comment (v21) to level ID: ${req.body.levelID}`);

			const result = await uploadComment(
				gdpsid,
				req.body.userName,
				req.body.gameVersion,
				req.body.comment,
				req.body.levelID,
				req.body.percent,
				req.body.udid,
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req
			);

			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadComment21Handler", `Error uploading comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class DeleteCommentHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/deleteGJComment20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to delete comment ID: ${req.body.commentID}`);
			const result = await deleteComment(gdpsid, req.body.accountID, req.body.gjp2, req.body.gjp, req.body.commentID, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("DeleteCommentHandler", `Error deleting comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

// Обработчики для комментариев к аккаунтам
export class GetAccountCommentsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJAccountComments20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request for account comments, account ID: ${req.body.accountID}`);
			const result = await getAccountComments(gdpsid, req.body.accountID, req.body.page, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("GetAccountCommentsHandler", `Error getting account comments: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class UploadAccountCommentHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadGJAccComment20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to upload comment to account ID: ${req.body.accountID}`);
			const result = await uploadAccountComment(
				gdpsid,
				req.body.userName,
				req.body.accountID,
				req.body.comment,
				req.body.gjp,
				req.body.gjp2,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadAccountCommentHandler", `Error uploading account comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export class DeleteAccountCommentHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/deleteGJAccComment20.php");
	}

	async handle(req: Request, res: Response): Promise<void> {
		try {
			const gdpsid: string = req.params.gdpsid.toString();
			ConsoleApi.Log("Comments", `Processing request to delete account comment ID: ${req.body.commentID}`);
			const result = await deleteAccountComment(gdpsid, req.body.commentID, req.body.accountID, req.body.gjp2, req.body.gjp, req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("DeleteAccountCommentHandler", `Error deleting account comment: ${error}`);
			res.status(200).send("-1");
		}
	}
}

export function createCommentHandlers() {
	return [
		// Уровневые комментарии
		new GetCommentsHandler(),
		new GetComments19Handler(),
		new GetComments20Handler(),
		new GetComments21Handler(),
		new UploadCommentHandler(),
		new UploadComment19Handler(),
		new UploadComment20Handler(),
		new UploadComment21Handler(),
		new DeleteCommentHandler(),

		// Аккаунтовые комментарии
		new GetAccountCommentsHandler(),
		new UploadAccountCommentHandler(),
		new DeleteAccountCommentHandler()
	];
}
