import type { Address } from 'abitype'

import type { Message } from './types.js'

export function parseMessage(message: string): Message {
  const prefix = (message.match(prefixRegex)?.groups ?? {}) as {
    address: Address
    domain: string
    scheme?: string
    statement?: string
  }
  const suffix = (message.match(suffixRegex)?.groups ?? {}) as {
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
  return {
    ...prefix,
    ...suffix,
    chainId: Number(suffix.chainId),
    resources: suffix.resources?.split('\n- '),
  }
}

// https://regexr.com/80gdj
const prefixRegex =
  /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+.-]*):\/\/)?(?<domain>[a-zA-Z0-9+.-]*) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/

// TODO: Resources
// https://regexr.com/80gf9
const suffixRegex =
  /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/
