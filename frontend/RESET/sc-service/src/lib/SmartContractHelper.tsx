import { ethers } from 'ethers';
import resetAbi from './common/resetABI.json';
import incidentAbi from './common/incidentABI.json';
import * as crypto from 'crypto';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Derives a private key using HKDF from a given hash.
 * @param hash - The input hash (e.g., derived from a signature).
 * @param length - The desired length of the derived key (default is 32 bytes).
 * @returns A Buffer containing the derived private key.
 */
export function derivePrivateKey(hash: Buffer, length: number = 32): Buffer {
    return Buffer.from(crypto.hkdfSync('sha256', hash, Buffer.alloc(0), Buffer.from('ECDH Key Derivation'), length));
}

/**
 * Generates an ECDH keypair (private and public key) from a given hash.
 * @param hash - The hash to derive the private key from.
 * @returns An object containing the private and public keys.
 */
export function generateECDHKeypairFromHash(hash: Buffer): { privateKey: Buffer; publicKey: Buffer } {
    const derivedPrivateKey = derivePrivateKey(hash);

    const ecdh = crypto.createECDH('secp256k1');

    ecdh.setPrivateKey(derivedPrivateKey);

    const publicKey = ecdh.getPublicKey();

    return {
        privateKey: ecdh.getPrivateKey(),
        publicKey: publicKey,
    };
}

/**
 * Generates a shared secret using ECDH.
 * @param privateKey - Your private key.
 * @param recipientPublicKey - The recipient's public key.
 * @returns A Buffer containing the shared secret.
 */
export function generateSharedSecret(privateKey: Buffer, recipientPublicKey: Buffer): Buffer {
    const ecdh = crypto.createECDH('secp256k1');
    ecdh.setPrivateKey(privateKey);
    return ecdh.computeSecret(recipientPublicKey);
}

export function encryptMessage(sharedSecret: Buffer, message: string): Buffer {
    const cipher = crypto.createCipheriv('aes-256-ecb', sharedSecret.slice(0, 32), null);
    return Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
}

export function decryptMessage(sharedSecret: Buffer, encryptedMessage: Buffer): string {
    const decipher = crypto.createDecipheriv('aes-256-ecb', sharedSecret.slice(0, 32), null);
    const decrypted = Buffer.concat([decipher.update(encryptedMessage), decipher.final()]);
    return decrypted.toString('utf8');
}