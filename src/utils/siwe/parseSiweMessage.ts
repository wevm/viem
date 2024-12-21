import * as Siwe from 'ox/Siwe'

import type { ExactPartial, Prettify } from '../../types/utils.js'

/**
 * @description Parses EIP-4361 formatted message into message fields object.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 *
 * @returns EIP-4361 fields object
 */
export function parseSiweMessage(
  message: string,
): Prettify<ExactPartial<Siwe.Message>> {
  return Siwe.parseMessage(message)
}
