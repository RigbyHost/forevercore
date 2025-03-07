'package net.fimastgd.forevercore.api.lib.XORCipher';
// 'package net.fimastgd.forevercore.api.lib.КЕФИР';

class XORCipher {
    static cipher(plaintextStr, keyStr) {
        let key, plaintext;
        key = this.text2ascii(keyStr);
        plaintext = this.text2ascii(plaintextStr);
        const keysize = key.length;
        const inputSize = plaintext.length;
        let cipher = "";
        for (let i = 0; i < inputSize; i++) {
            cipher += String.fromCharCode(plaintext[i] ^ key[i % keysize]);
        }
        return cipher;
    }
    static text2ascii(textStr) {
        let text;
        if (typeof textStr !== "string") {
            text = textStr.toString();
        } else {
            text = textStr;
        }
        return Array.from(text).map(char => char.charCodeAt(0));
    }
}

module.exports = XORCipher; 
