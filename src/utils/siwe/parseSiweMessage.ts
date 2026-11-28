import type { Address } from 'abitype'

import type { ExactPartial, Prettify } from '../../types/utils.js'
import type { SiweMessage } from './types.js'

const siweDateTimeRegex =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

function isValidSiweDateTime(value: string): boolean {
  const match = value.match(siweDateTimeRegex)
  if (!match) return false
  if (Number.isNaN(new Date(value).getTime())) return false
  // JS Date rolls over out-of-range parts (`2023-02-30` becomes March 2), so
  // check that each part survives a round trip.
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year!, month! - 1, day!)
  date.setUTCHours(hour!, minute!, second!)
  return (
    date.getUTCMonth() === month! - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  )
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
  const prefixMatch = message.match(prefixRegex)
  const suffixMatch = message.match(suffixRegex)
  // A statement with a line break skips the optional `statement` group, so
  // check the text between the blank line after the address and the suffix.
  if (prefixMatch && suffixMatch) {
    const section = message
      .slice(message.indexOf('\n\n') + 2, suffixMatch.index)
      .replace(/\n\n?$/, '')
    if (/[\r\n\u2028\u2029]/.test(section)) return {}
  }
  // Text after the suffix is out of order or not part of EIP-4361 (such as an
  // `Expiration Time` after `Not Before`), so the parsed fields would omit it.
  if (
    suffixMatch &&
    suffixMatch.index! + suffixMatch[0].length !== message.length
  )
    return {}
  const { scheme, statement, ...prefix } = (prefixMatch?.groups ?? {}) as {
    address: Address
    domain: string
    scheme?: string
    statement?: string
  }
  const {
    chainId,
    expirationTime,
    issuedAt,
    notBefore,
    requestId,
    resources: resources_,
    ...suffix
  } = (suffixMatch?.groups ?? {}) as {
    chainId: string
    expirationTime?: string
    issuedAt?: string
    nonce: string
    notBefore?: string
    requestId?: string
    resources?: string
    uri: string
    version: '1'
  }
  const resources = resources_?.split('\n- ').slice(1)
  return {
    ...prefix,
    ...suffix,
    ...(chainId ? { chainId: Number(chainId) } : {}),
    ...(expirationTime
      ? { expirationTime: parseSiweDateTime(expirationTime) }
      : {}),
    ...(issuedAt ? { issuedAt: parseSiweDateTime(issuedAt) } : {}),
    ...(notBefore ? { notBefore: parseSiweDateTime(notBefore) } : {}),
    ...(requestId !== undefined ? { requestId } : {}),
    ...(resources ? { resources } : {}),
    ...(scheme ? { scheme } : {}),
    ...(statement !== undefined ? { statement } : {}),
  }
}

// https://regexr.com/80gdj
const prefixRegex =
  /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+\-.]*):\/\/)?(?<domain>(?:(?:[a-zA-Z0-9\-._~!$&'()*+,;=:]|%[0-9a-fA-F]{2})*@)?(?:\[[a-zA-Z0-9\-._~!$&'()*+,;=:]+\]|(?:[a-zA-Z0-9\-._~!$&'()*+,;=]|%[0-9a-fA-F]{2})+)(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/

// https://regexr.com/80gf9
const suffixRegex =
  /^(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.*))?(?:\nResources:(?<resources>(?:\n- .+)*))?/m
