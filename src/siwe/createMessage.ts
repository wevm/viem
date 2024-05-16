import type { ErrorType } from '../errors/utils.js'
import { isAddress } from '../utils/address/isAddress.js'
import type { Message } from './types.js'
import { isISO8601, isUri } from './utils.js'

export type CreateMessageParameters = Message

export type CreateMessageReturnType = string

export type CreateMessageErrorType = ErrorType

/**
 * https://eips.ethereum.org/EIPS/eip-4361
 */
export function createMessage(
  parameters: CreateMessageParameters,
): CreateMessageReturnType {
  const {
    address,
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

  ////////////////////////////////////////////////////////////////////////////////
  // Validate fields
  ////////////////////////////////////////////////////////////////////////////////

  // TODO: Custom errors
  if (!isAddress(address)) throw new Error('Invalid address')
  if (!domainRegex.test(domain)) throw new Error('Invalid domain')
  if (!nonceRegex.test(nonce)) throw new Error('Invalid nonce')
  if (uri && !isUri(uri)) throw new Error('Invalid uri')
  if (version !== '1') throw new Error('Invalid version')

  if (issuedAt && !isISO8601(issuedAt)) throw new Error('Invalid issuedAt')
  // TODO: Check that statement doesn't contain '\n'
  // if (statement && ) throw new Error('Invalid statement')

  ////////////////////////////////////////////////////////////////////////////////
  // Construct message
  ////////////////////////////////////////////////////////////////////////////////

  /**
  ${scheme}:// ${domain} wants you to sign in with your Ethereum account:
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

  const origin = (() => {
    if (scheme) return `${scheme}://${domain}`
    return domain
  })()
  const statementSeparator = parameters.statement ? '\n' : ''
  const statement = `${statementSeparator}${
    parameters.statement ?? ''
  }${statementSeparator}`
  const prefix = `${origin} wants you to sign in with your Ethereum account:\n${address}\n${statement}`

  let suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}`
  suffix += `\nIssued At: ${issuedAt ?? new Date().toISOString()}`

  if (expirationTime) {
    if (!isISO8601(expirationTime)) throw new Error('Invalid expirationTime')
    suffix += `\nExpiration Time: ${expirationTime}`
  }
  if (notBefore) {
    if (!isISO8601(notBefore)) throw new Error('Invalid notBefore')
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

const domainRegex = /^(?:(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63})$/
const nonceRegex = /^[a-zA-Z0-9]{8,}$/
