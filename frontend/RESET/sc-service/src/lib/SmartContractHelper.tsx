import { ethers, getAddress, getBytes } from 'ethers';
import resetAbi from './common/resetABI.json';
import incidentAbi from './common/incidentABI.json';
import * as crypto from 'crypto';
import { CheckMetaMask, registerPublicKey, signMessageWithMetamask } from 'SCService';
import * as secp from '@noble/secp256k1';

declare global {
  interface Window {
    ethereum?: any;
  }
}


/**
 * Derives a valid secp256k1 private key from a hash.
 * If the hash is not valid, it will rehash until it is.
 */
export async function derivePrivateKey(hash: Uint8Array): Promise<Uint8Array> {
  let candidate = hash;
  while (!secp.utils.isValidPrivateKey(candidate)) {
    // Rehash until valid
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', candidate);
    candidate = new Uint8Array(hashBuffer);
  }
  return candidate;
}

/**
 * Generates an ECDH keypair (private and public key) from a given hash.
 */
export async function generateECDHKeypairFromHash(hash: Uint8Array): Promise<{ privateKey: Uint8Array; publicKey: Uint8Array }> {
  const privateKey = await derivePrivateKey(hash);
  const publicKey = secp.getPublicKey(privateKey, true); // compressed
  return { privateKey, publicKey };
}

/**
 * Generates a shared secret using ECDH (secp256k1).
 */
export function generateSharedSecret(privateKey: Uint8Array, recipientPublicKey: Uint8Array): Uint8Array {
  // Returns 65 bytes, first byte is 0x04 (uncompressed), slice to get 32 bytes
  const shared = secp.getSharedSecret(privateKey, recipientPublicKey, true);
  return shared.slice(1, 33); // 32 bytes
}

/**
 * Encrypts a message using AES-GCM with the shared secret.
 * @param sharedSecret - The shared secret (Uint8Array, 32 bytes).
 * @param message - The plaintext message to encrypt.
 * @returns An object with ciphertext (ArrayBuffer) and iv (Uint8Array).
 */
export async function encryptMessage(sharedSecret: Uint8Array, message: string): Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await window.crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(message)
  );
  return { ciphertext, iv };
}

/**
 * Decrypts a message using AES-GCM with the shared secret.
 * @param sharedSecret - The shared secret (Uint8Array, 32 bytes).
 * @param ciphertext - The encrypted message (ArrayBuffer).
 * @param iv - The initialization vector used during encryption (Uint8Array).
 * @returns The decrypted plaintext string.
 */
export async function decryptMessage(sharedSecret: Uint8Array, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<string> {
  const key = await window.crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}


export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}



/**
 * Ensures a reset private key exists for the given address.
 * Returns the private key as a hex string, or throws on error.
 */
export async function ensureResetPrivateKey(address?: string): Promise<string | null> {
  if (!address) {
    console.error('No connected address');
    return null;
  }

  const keyDictRaw = localStorage.getItem('resetPrivateKeyDict');
  let keyDict: Record<string, string> = keyDictRaw ? JSON.parse(keyDictRaw) : {};

  const normalizedAddress = getAddress(address).toLowerCase();
  let resetPrivateKey = keyDict[normalizedAddress];

  if (!resetPrivateKey) {
    // 1. Sign a message with MetaMask (returns a signature string)
    const signature = await signMessageWithMetamask();

    // 2. Hash the signature to get a seed for the private key
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(signature));
    const hash = new Uint8Array(hashBuffer);

    // 3. Generate ECDH keypair from the hash
    const keypair = await generateECDHKeypairFromHash(hash);

    // 4. Store the private key as hex string
    resetPrivateKey = uint8ArrayToHex(keypair.privateKey);
    keyDict[normalizedAddress] = resetPrivateKey;
    localStorage.setItem('resetPrivateKeyDict', JSON.stringify(keyDict));

    // TO-DO: DODAJ PROVERU DA LI JE VEC REGISTROVAN JAVNI KLJUC PREKO GRAFA

    // 5. Register the public key (as 64 bytes, uncompressed, no 0x04 prefix)
    const publicKeyUncompressed = secp.getPublicKey(keypair.privateKey, false); // 65 bytes, starts with 0x04
    const publicKey64 = publicKeyUncompressed.slice(1); // Remove 0x04 prefix
    const success = await registerPublicKey(publicKey64);
    if (!success) {
      console.error('Failed to register public key');
      return null;
    }
  }
  console.log(`Reset private key for ${normalizedAddress}: ${resetPrivateKey}`);

  return resetPrivateKey;
}


// Combine IV and ciphertext
export function combineIvAndCiphertext(iv: Uint8Array, ciphertext: ArrayBuffer): Uint8Array {
  const ct = new Uint8Array(ciphertext);
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0);
  combined.set(ct, iv.length);
  return combined;
}

// Split IV and ciphertext
export function splitIvAndCiphertext(combined: Uint8Array): { iv: Uint8Array, ciphertext: Uint8Array } {
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  return { iv, ciphertext };
}