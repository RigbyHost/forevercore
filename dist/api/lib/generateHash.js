'package net.fimastgd.forevercore.api.lib.generateHash';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const db_proxy_1 = __importDefault(require("../../serverconf/db-proxy"));
/**
 * Utility class for generating verification hashes
 */
class GenerateHash {
    /**
     * Generate hash for multiple levels
     * @param lvlsmultistring - Array of level data
     * @returns SHA1 hash
     */
    static async genMulti(lvlsmultistring) {
        let hash = "";
        for (const result of lvlsmultistring) {
            const id = result.levelID.toString();
            hash += id[0] + id[id.length - 1] + result.stars + result.coins;
        }
        return crypto_1.default.createHash('sha1').update(hash + "xI25fpAapCQg").digest('hex');
    }
    /**
     * Generate hash for level string
     * @param levelstring - Level data string
     * @returns SHA1 hash
     */
    static genSolo(levelstring) {
        const len = levelstring.length;
        if (len < 41) {
            return crypto_1.default.createHash('sha1').update(levelstring + "xI25fpAapCQg").digest('hex');
        }
        let hash = '????????????????????????????????????????xI25fpAapCQg';
        const m = Math.floor(len / 40);
        for (let i = 39; i >= 0; i--) {
            hash = hash.substring(0, i) + levelstring[i * m] + hash.substring(i + 1);
        }
        return crypto_1.default.createHash('sha1').update(hash).digest('hex');
    }
    /**
     * Generate secondary hash for level data
     * @param lvlsmultistring - Level data string
     * @returns SHA1 hash
     */
    static genSolo2(lvlsmultistring) {
        return crypto_1.default.createHash('sha1').update(lvlsmultistring + "xI25fpAapCQg").digest('hex');
    }
    /**
     * Generate tertiary hash for level data
     * @param lvlsmultistring - Level data string
     * @returns SHA1 hash
     */
    static genSolo3(lvlsmultistring) {
        return crypto_1.default.createHash('sha1').update(lvlsmultistring + "oC36fpYaPtdg").digest('hex');
    }
    /**
     * Generate quaternary hash for level data
     * @param lvlsmultistring - Level data string
     * @returns SHA1 hash
     */
    static genSolo4(lvlsmultistring) {
        return crypto_1.default.createHash('sha1').update(lvlsmultistring + "pC26fpYaQCtg").digest('hex');
    }
    /**
     * Generate hash for map pack data
     * @param lvlsmultistring - Map pack level IDs separated by commas
     * @returns SHA1 hash
     */
    static async genPack(lvlsmultistring) {
        const lvlsarray = lvlsmultistring.split(",");
        let hash = "";
        for (const id of lvlsarray) {
            const idParse = id.toString();
            const [result2] = await db_proxy_1.default.execute("SELECT stars, coins FROM mappacks WHERE ID = ?", [idParse]);
            // Process database result
            if (result2.length > 0) {
                const stars = result2[0].stars.toString();
                const coins = result2[0].coins.toString();
                hash += idParse[0] + idParse[idParse.length - 1] + stars + coins;
            }
        }
        return crypto_1.default.createHash('sha1').update(hash + "xI25fpAapCQg").digest('hex');
    }
    /**
     * Generate seed hash without XOR
     * @param levelstring - Level data string
     * @returns SHA1 hash
     */
    static genSeed2noXor(levelstring) {
        let hash = "aaaaa";
        const len = levelstring.length;
        const divided = Math.floor(len / 50);
        let p = 0;
        for (let k = 0; k < len && p < 50; k += divided) {
            hash = hash.substring(0, p) + levelstring[k] + hash.substring(p + 1);
            p++;
        }
        return crypto_1.default.createHash('sha1').update(hash + "xI25fpAapCQg").digest('hex');
    }
}
exports.default = GenerateHash;
