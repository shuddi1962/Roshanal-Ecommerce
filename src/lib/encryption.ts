/**
 * AES-256 Encryption Utility
 * Used exclusively by the API Vault for key storage/retrieval.
 * Never log encrypted or decrypted values.
 */

import CryptoJS from 'crypto-js'

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters')
  }
  return key
}

/**
 * Encrypt a plaintext string using AES-256 (CBC mode via CryptoJS)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const encrypted = CryptoJS.AES.encrypt(plaintext, key)
  return encrypted.toString()
}

/**
 * Decrypt an AES-256 encrypted string
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey()
  const bytes = CryptoJS.AES.decrypt(ciphertext, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Encrypt a key-value map (used for API Vault batch storage)
 */
export function encryptObject(obj: Record<string, string>): string {
  return encrypt(JSON.stringify(obj))
}

/**
 * Decrypt a key-value map
 */
export function decryptObject(ciphertext: string): Record<string, string> {
  const json = decrypt(ciphertext)
  return JSON.parse(json) as Record<string, string>
}

/**
 * Hash a string using SHA-256 (for audit trail, non-reversible)
 */
export function hashSHA256(input: string): string {
  return CryptoJS.SHA256(input).toString()
}
