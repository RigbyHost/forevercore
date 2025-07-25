`package net.fimastgd.forevercore.handlers`;

import { createAccountHandlers } from './account-handlers';
import { createCommunicationHandlers } from './message-handlers';
import { createLevelHandlers } from './level-handlers';
import { createListHandlers } from './list-handlers';
import { createModsHandlers } from './mods-handlers';
import { createOtherHandlers } from './other-handlers';
import { createPacksHandlers } from './packs-handlers';
import { createRewardsHandlers } from './rewards-handlers';
import { createScoresHandlers } from './score-handlers';
import { createSystemHandlers } from './system-handlers';
import { createCommentHandlers } from './comment-handlers';
import { createFriendshipHandlers } from './friendship-handlers';
import { ApiHandler } from '../api-router';

export function createAllHandlers(): ApiHandler[] {
	return [
		...createAccountHandlers(),
		...createCommunicationHandlers(),
		...createLevelHandlers(),
		...createListHandlers(),
		...createModsHandlers(),
		...createOtherHandlers(),
		...createPacksHandlers(),
		...createRewardsHandlers(),
		...createScoresHandlers(),
		...createSystemHandlers(),
		...createCommentHandlers(),
		...createFriendshipHandlers()
	];
}
