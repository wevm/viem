import { uid } from '../utils/uid.js'

/**
 * @description Generates random nonce.
 *
 * @example
 * const nonce = generateNonce()
 *
 * @returns A randomly generated nonce.
 */
export function generateNonce(): string {
  return uid(96)
}
