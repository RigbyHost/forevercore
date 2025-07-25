`package net.fimastgd.forevercore.routes.handlers.friendship-handlers`;

import { Request, Response } from "express";
import { BaseApiHandler } from "../api-router";
import ConsoleApi from "../../modules/console-api";
import acceptFriendRequest from "../../api/friendships/acceptFriendRequest";
import blockUser from "../../api/friendships/blockUser";
import deleteFriendRequests from "../../api/friendships/deleteFriendRequests";
import getFriendRequests from "../../api/friendships/getFriendRequests";
import getUserList from "../../api/friendships/getUserList";
import readFriendRequest from "../../api/friendships/readFriendRequest";
import removeFriend from "../../api/friendships/removeFriend";
import unblockUser from "../../api/friendships/unblockUser";
import uploadFriendRequest from "../../api/friendships/uploadFriendRequest";

export class AcceptFriendRequestHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/acceptGJFriendRequest20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await acceptFriendRequest(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error(
				"AcceptFriendRequestHandler",
				`Error accepting friend request: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`
			);
			res.status(200).send("-1");
		}
	}
}

export class BlockUserHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/blockGJUser20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await blockUser(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("BlockUserHandler", `Error blocking user: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`);
			res.status(200).send("-1");
		}
	}
}

export class DeleteFriendRequestsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/deleteGJFriendRequests20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await deleteFriendRequests(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error(
				"DeleteFriendRequestsHandler",
				`Error deleting friend requests: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`
			);
			res.status(200).send("-1");
		}
	}
}

export class GetFriendRequestsHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJFriendRequests20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getFriendRequests(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error(
				"GetFriendRequestsHandler",
				`Error getting friend requests: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`
			);
			res.status(200).send("-1");
		}
	}
}

export class GetUserListHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/getGJUserList20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await getUserList(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error(
				"GetUserListHandler",
				`Error getting user list: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`
			);
			res.status(200).send("-1");
		}
	}
}

export class ReadFriendRequestHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/readGJFriendRequest20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await readFriendRequest(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error(
				"ReadFriendRequestHandler",
				`Error reading friend request: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`
			);
			res.status(200).send("-1");
		}
	}
}

export class RemoveFriendHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/removeGJFriend20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await removeFriend(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error(
				"RemoveFriendHandler",
				`Error removing friend: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`
			);
			res.status(200).send("-1");
		}
	}
}

export class UnblockUserHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/unblockGJUser20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await unblockUser(req.params.gdpsid.toString(), req);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UnblockUserHandler", `Error unblocking user: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`);
			res.status(200).send("-1");
		}
	}
}

export class UploadFriendRequestHandler extends BaseApiHandler {
	constructor() {
		super("/:gdpsid/uploadFriendRequest20.php");
	}

	public async handle(req: Request, res: Response): Promise<void> {
		try {
			const result = await uploadFriendRequest(
				req.params.gdpsid.toString(),
				req.body.accountID,
				req.body.gjp2,
				req.body.gjp,
				req.body.toAccountID,
				req.body.commentStr,
				req
			);
			res.status(200).send(result);
		} catch (error) {
			ConsoleApi.Error("UploadFriendRequestHandler", `Error uploading friend request: ${error} at net.fimastgd.forevercore.routes.handlers.friendship-handlers`);
			res.status(200).send("-1");
		}
	}
}

export function createFriendshipHandlers() {
	return [
		new AcceptFriendRequestHandler(),
		new BlockUserHandler(),
		new DeleteFriendRequestsHandler(),
		new GetFriendRequestsHandler(),
		new GetUserListHandler(),
		new ReadFriendRequestHandler(),
		new RemoveFriendHandler(),
		new UnblockUserHandler(),
		new UploadFriendRequestHandler()
	];
}
