import * as Hex from 'ox/Hex'

/**
 * @description Generates a random EIP-4361 nonce from a cryptographically
 * secure source.
 *
 * @example
 * const nonce = generateNonce()
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 *
 * @returns A randomly generated EIP-4361 nonce.
 */
export function generateSiweNonce(): string {
  return Hex.random(48).slice(2)
}
