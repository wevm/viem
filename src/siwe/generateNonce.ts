import { uid } from '../utils/uid.js'

/**
 * @description Generates random nonce.
 *
 * @returns A randomly generated nonce.
 */
export function generateNonce(): string {
  return uid(96)
}
