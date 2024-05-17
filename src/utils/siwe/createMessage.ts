import {
  SiweInvalidDomainError,
  type SiweInvalidDomainErrorType,
  SiweInvalidISO8601Error,
  type SiweInvalidISO8601ErrorType,
  SiweInvalidNonceError,
  type SiweInvalidNonceErrorType,
  SiweInvalidUriError,
  type SiweInvalidUriErrorType,
  SiweInvalidVersionError,
} from '../../errors/siwe.js'
import type { ErrorType } from '../../errors/utils.js'
import { type GetAddressErrorType, getAddress } from '../address/getAddress.js'
import type { Message } from './types.js'
import { isISO8601, isUri } from './utils.js'

export type CreateMessageParameters = Message

export type CreateMessageReturnType = string

export type CreateMessageErrorType =
  | GetAddressErrorType
  | SiweInvalidDomainErrorType
  | SiweInvalidNonceErrorType
  | SiweInvalidUriErrorType
  | SiweInvalidVersionError
  | SiweInvalidISO8601ErrorType
  | ErrorType

/**
 * @description Creates EIP-4361 formated message.
 *
 * @example
 * const message = createMessage({
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   chainId: 1,
 *   domain: 'example.com',
 *   nonce: 'foobarbaz',
 *   uri: 'https://example.com/path',
 *   version: '1',
 * })
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
export function createMessage(
  parameters: CreateMessageParameters,
): CreateMessageReturnType {
  const {
    chainId,
    domain,
    expirationTime,
    issuedAt,
    nonce,
    notBefore,
    requestId,
    resources,
    scheme,
    uri,
    version,
  } = parameters

  if (!domainRegex.test(domain)) throw new SiweInvalidDomainError({ domain })
  if (!nonceRegex.test(nonce)) throw new SiweInvalidNonceError({ nonce })
  if (!isUri(uri)) throw new SiweInvalidUriError({ uri })
  if (version !== '1') throw new SiweInvalidVersionError({ version })

  if (issuedAt && !isISO8601(issuedAt))
    throw new SiweInvalidISO8601Error({ name: 'issuedAt', value: issuedAt })
  // TODO: Check that statement doesn't contain '\n'
  // if (statement && ) throw new Error('Invalid statement')

  const address = getAddress(parameters.address)
  const origin = (() => {
    if (scheme) return `${scheme}://${domain}`
    return domain
  })()
  const statement = (() => {
    if (!parameters.statement) return ''
    const separator = parameters.statement ? '\n' : ''
    return `${separator}${parameters.statement}${separator}`
  })()
  const prefix = `${origin} wants you to sign in with your Ethereum account:\n${address}\n${statement}`

  let suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${
    issuedAt ?? new Date().toISOString()
  }`

  if (expirationTime) {
    if (!isISO8601(expirationTime))
      throw new SiweInvalidISO8601Error({
        name: 'expirationTime',
        value: expirationTime,
      })
    suffix += `\nExpiration Time: ${expirationTime}`
  }
  if (notBefore) {
    if (!isISO8601(notBefore))
      throw new SiweInvalidISO8601Error({ name: 'notBefore', value: notBefore })
    suffix += `\nNot Before: ${notBefore}`
  }
  if (requestId) suffix += `\nRequest ID: ${requestId}`
  if (resources) {
    let content = '\nResources:'
    for (const resource of resources) content += `\n- ${resource}`
    suffix += content
  }

  return `${prefix}\n${suffix}`
}

/**
  ${scheme}://${domain} wants you to sign in with your Ethereum account:
  ${address}

  ${statement}

  URI: ${uri}
  Version: ${version}
  Chain ID: ${chainId}
  Nonce: ${nonce}
  Issued At: ${issuedAt}
  Expiration Time: ${expirationTime}
  Not Before: ${notBefore}
  Request ID: ${requestId}
  Resources:
  - ${resources[0]}
  - ${resources[1]}
  ...
  - ${resources[n]}
  */

const domainRegex = /^(?:(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63})$/
const nonceRegex = /^[a-zA-Z0-9]{8,}$/
