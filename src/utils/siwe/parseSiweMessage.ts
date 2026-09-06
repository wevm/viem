import type { Address } from 'abitype'

import type { ExactPartial, Prettify } from '../../types/utils.js'
import type { SiweMessage } from './types.js'

const siweDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

function isValidSiweDateTime(value: string): boolean {
  if (!siweDateTimeRegex.test(value)) return false
  return !Number.isNaN(new Date(value).getTime())
}

function parseSiweDateTime(value: string): Date {
  // Reject non-RFC-3339 / non-EIP-4361 date-time strings before Date coercion
  // (JS Date accepts many non-SIWE forms that would otherwise look "valid").
  if (!isValidSiweDateTime(value)) return new Date(Number.NaN)
  return new Date(value)
}

/**
 * @description Parses EIP-4361 formatted message into message fields object.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 *
 * @returns EIP-4361 fields object
 */
export function parseSiweMessage(
  message: string,
): Prettify<ExactPartial<SiweMessage>> {
  const { scheme, statement, ...prefix } = (message.match(prefixRegex)
    ?.groups ?? {}) as {
    address: Address
    domain: string
    scheme?: string
    statement?: string
  }
  const { chainId, expirationTime, issuedAt, notBefore, requestId, ...suffix } =
    (message.match(suffixRegex)?.groups ?? {}) as {
      chainId: string
      expirationTime?: string
      issuedAt?: string
      nonce: string
      notBefore?: string
      requestId?: string
      uri: string
      version: '1'
    }
  const resources = message.split('Resources:')[1]?.split('\n- ').slice(1)
  return {
    ...prefix,
    ...suffix,
    ...(chainId ? { chainId: Number(chainId) } : {}),
    ...(expirationTime
      ? { expirationTime: parseSiweDateTime(expirationTime) }
      : {}),
    ...(issuedAt ? { issuedAt: parseSiweDateTime(issuedAt) } : {}),
    ...(notBefore ? { notBefore: parseSiweDateTime(notBefore) } : {}),
    ...(requestId ? { requestId } : {}),
    ...(resources ? { resources } : {}),
    ...(scheme ? { scheme } : {}),
    ...(statement ? { statement } : {}),
  }
}

// https://regexr.com/80gdj
const prefixRegex =
  /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+\-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/

// https://regexr.com/80gf9
const suffixRegex =
  /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/
