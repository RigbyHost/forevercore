'package net.fimastgd.forevercore.SystemControl.SystemControl'

import threadConnection from '../serverconf/db';
import isOnlineMode from './checkOnlineMode';

import { checkGDPS } from './validation/checkGDPS';
import { expired } from './validation/expired';
import { checkActive } from './connection/checkActive'; 
import ConsoleApi from 'net.fimastgd.forevercore.modules.console-api';

/** @alias number */
type int = number;

/** @alias number */
type float = number;

/** @alias boolean */
type bool = boolean;


export class SystemControl {
	public static validation = class {
		/** Проверяет, существует ли GDPS в реестре
		 * @param id - GDPS ID
		 * @param node - GDPS node
		 * @returns true (GDPS существует) / false (GDPS не существует)
		*/
		public static async checkGDPS(id: string, node: string): Promise<bool> {
			if (isOnlineMode()) {
				const result = await checkGDPS(id, node);
				return result;
			} else {
				return true; // пиратский режим для одиночных GDPS на самохосте
			}
		}

		/** Проверяет, просрочен ли GDPS
		 * @param id - GDPS ID
		 * @param node - GDPS node
		 * @returns true (GDPS просрочен) / false (GDPS действителен)
		*/
		public static async expired(id: string, node: string): Promise<bool> {
			if (isOnlineMode()) {
				const result = await expired(id, node);
				return result;
			} else {
				return false;
			}
		}
	}
	public static connection = class {
		/** Проверяет статус GDPS
		 * @param id - GDPS ID
		 * @param node - GDOS node
		 * @returns true (GDPS активен) / false (GDPS выключен)
		 */
		public static async checkActive(id: string, node: string): Promise<bool> {
			if (isOnlineMode()) {
				const result = await checkActive(id, node);
				return result;
			} else {
				return false;
			} 
		}
	}
} 