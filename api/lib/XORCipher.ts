'package net.fimastgd.forevercore.api.lib.XORCipher';

/**
 * XOR cipher for password encryption used in Geometry Dash
 */
class XORCipher {
    /**
     * Apply XOR cipher to a string with a numeric key
     * @param plaintextStr - Text to encrypt/decrypt
     * @param keyStr - Numeric encryption key
     * @returns Encrypted/decrypted string
     */
    static cipher(plaintextStr: string | number, keyStr: string | number): string {
        const key = this.text2ascii(keyStr);
        const plaintext = this.text2ascii(plaintextStr);
        const keysize = key.length;
        const inputSize = plaintext.length;

        let result = "";

        for (let i = 0; i < inputSize; i++) {
            result += String.fromCharCode(plaintext[i] ^ key[i % keysize]);
        }

        return result;
    }

    /**
     * Convert text to array of ASCII codes
     * @param textStr - Text to convert
     * @returns Array of ASCII code values
     */
    static text2ascii(textStr: string | number): number[] {
        const text = typeof textStr !== "string" ? textStr.toString() : textStr;
        return Array.from(text).map(char => char.charCodeAt(0));
    }

    /**
     * Encrypt a password using the Geometry Dash algorithm
     * @param password - Plain text password
     * @param key - Encryption key
     * @returns Base64 encoded encrypted password
     */
    static encryptGJP(password: string, key: number = 37526): string {
        const encrypted = this.cipher(password, key);
        const base64 = Buffer.from(encrypted, 'binary').toString('base64');
        return base64.replace(/\//g, '_').replace(/\+/g, '-');
    }

    /**
     * Decrypt a Geometry Dash password
     * @param gjp - Encrypted GJP string
     * @param key - Decryption key
     * @returns Decrypted password
     */
    static decryptGJP(gjp: string, key: number = 37526): string {
        const base64 = gjp.replace(/_/g, '/').replace(/-/g, '+');
        const binary = Buffer.from(base64, 'base64').toString('binary');
        return this.cipher(binary, key);
    }
}

export default XORCipher;