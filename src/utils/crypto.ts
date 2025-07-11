import bcrypt from 'bcryptjs';

/**
 * Password hashing and verification
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate GD-compatible hash for responses
 * This is a simplified version - implement proper GD hash logic
 */
export function generateGDHash(data: string): string {
  // GD uses SHA-1 with specific salt/key
  // For now, return a simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * XOR cipher for GD data encoding/decoding
 */
export function xorCipher(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const dataChar = data.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(dataChar ^ keyChar);
  }
  return result;
}

/**
 * Base64 URL-safe encoding/decoding
 */
export function base64UrlEncode(data: string): string {
  return Buffer.from(data, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64UrlDecode(data: string): string {
  // Add padding if needed
  while (data.length % 4) {
    data += '=';
  }
  
  return Buffer.from(
    data.replace(/-/g, '+').replace(/_/g, '/'),
    'base64'
  ).toString('utf-8');
}

/**
 * Generate random string for secrets
 */
export function generateSecret(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}