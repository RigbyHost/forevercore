'package net.fimastgd.forevercore.api.lib.generateHash';

const crypto = require('crypto');
const db = require("../../serverconf/db");

class GenerateHash {
    static async genMulti(lvlsmultistring) {
        let hash = "";
        for (const result of lvlsmultistring) {
            const id = result.levelID.toString();
            hash += id[0] + id[id.length - 1] + result.stars + result.coins;
        }
        return crypto.createHash('sha1').update(hash + "xI25fpAapCQg").digest('hex');
    }

    static genSolo(levelstring) {
        const len = levelstring.length;
        if (len < 41) return crypto.createHash('sha1').update(levelstring + "xI25fpAapCQg").digest('hex');
        
        let hash = '????????????????????????????????????????xI25fpAapCQg';
        const m = Math.floor(len / 40);
        for (let i = 39; i >= 0; i--) {
            hash = hash.substring(0, i) + levelstring[i * m] + hash.substring(i + 1);
        }
        return crypto.createHash('sha1').update(hash).digest('hex');
    }

    static genSolo2(lvlsmultistring) {
        return crypto.createHash('sha1').update(lvlsmultistring + "xI25fpAapCQg").digest('hex');
    }

    static genSolo3(lvlsmultistring) {
        return crypto.createHash('sha1').update(lvlsmultistring + "oC36fpYaPtdg").digest('hex');
    }

    static genSolo4(lvlsmultistring) {
        return crypto.createHash('sha1').update(lvlsmultistring + "pC26fpYaQCtg").digest('hex');
    }

    static async genPack(lvlsmultistring) {
        const lvlsarray = lvlsmultistring.split(",");
        let hash = "";
        for (const id of lvlsarray) {
            const idParse = id.toString(); 
            const [result2] = await db.execute("SELECT stars, coins FROM mappacks WHERE ID = ?", [idParse]);
            
            // я совсем не знаю, почему этот ответ из базы данных обрабатывается так...
            let json_result = JSON.stringify(result2, null, 0);
            json_result = json_result.toString();
            // [{"stars": N, "coins": N}];
            const parsedData = JSON.parse(json_result);
            const firstItem = parsedData[0];
            let stars = firstItem.stars;
            let coins = firstItem.coins;
            stars = stars.toString();
            coins = coins.toString();
            
            const idstring = id;
            hash += idstring[0] + idstring[idstring.length - 1] + stars + coins;
        }
        return crypto.createHash('sha1').update(hash + "xI25fpAapCQg").digest('hex');
    }

    static genSeed2noXor(levelstring) {
        let hash = "aaaaa";
        const len = levelstring.length;
        const divided = Math.floor(len / 50);
        let p = 0;
        for (let k = 0; k < len && p < 50; k += divided) {
            hash = hash.substring(0, p) + levelstring[k] + hash.substring(p + 1);
            p++;
        }
        return crypto.createHash('sha1').update(hash + "xI25fpAapCQg").digest('hex');
    }
}

module.exports = GenerateHash;

