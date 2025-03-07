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
import { ApiHandler } from '../api-router';

/**
 * Создает и возвращает массив всех обработчиков API
 * @returns Массив всех API-обработчиков
 */
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
        ...createSystemHandlers()
    ];
}