import {
  SiweInvalidMessageFieldError,
  type SiweInvalidMessageFieldErrorType,
} from '../../errors/siwe.js'
import type { ErrorType } from '../../errors/utils.js'
import { type GetAddressErrorType, getAddress } from '../address/getAddress.js'
import type { Message } from './types.js'
import { isISO8601, isUri } from './utils.js'

export type CreateMessageParameters = Message

export type CreateMessageReturnType = string

export type CreateMessageErrorType =
  | GetAddressErrorType
  | SiweInvalidMessageFieldErrorType
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

  // Validate fields
  {
    // Required fields
    if (chainId !== Math.floor(chainId))
      throw new SiweInvalidMessageFieldError({
        field: 'chainId',
        metaMessages: [
          '- Chain ID must be a EIP-155 chain ID.',
          '- See https://eips.ethereum.org/EIPS/eip-155',
          '',
          `Provided value: ${chainId}`,
        ],
      })
    if (!domainRegex.test(domain))
      throw new SiweInvalidMessageFieldError({
        field: 'domain',
        metaMessages: [
          '- Domain must be an RFC 3986 authority.',
          '- See https://www.rfc-editor.org/rfc/rfc3986',
          '',
          `Provided value: ${domain}`,
        ],
      })
    if (!nonceRegex.test(nonce))
      throw new SiweInvalidMessageFieldError({
        field: 'nonce',
        metaMessages: [
          '- Nonce must be at least 8 characters.',
          '- Nonce must be alphanumeric.',
          '',
          `Provided value: ${nonce}`,
        ],
      })
    if (!isUri(uri))
      throw new SiweInvalidMessageFieldError({
        field: 'uri',
        metaMessages: [
          '- URI must be a RFC 3986 URI referring to the resource that is the subject of the signing.',
          '- See https://www.rfc-editor.org/rfc/rfc3986',
          '',
          `Provided value: ${uri}`,
        ],
      })
    if (version !== '1')
      throw new SiweInvalidMessageFieldError({
        field: 'version',
        metaMessages: [
          "- Version must be '1'.",
          '',
          `Provided value: ${version}`,
        ],
      })

    // Optional fields
    if (scheme && !schemeRegex.test(scheme))
      throw new SiweInvalidMessageFieldError({
        field: 'scheme',
        metaMessages: [
          '- Scheme must be an RFC 3986 URI scheme.',
          '- See https://www.rfc-editor.org/rfc/rfc3986#section-3.1',
          '',
          `Provided value: ${scheme}`,
        ],
      })
    if (issuedAt && !isISO8601(issuedAt))
      throw new SiweInvalidMessageFieldError({
        field: 'issuedAt',
        metaMessages: [
          '- Issued At must be an ISO 8601 datetime string.',
          '- See https://www.iso.org/iso-8601-date-and-time-format.html',
          '',
          `Provided value: ${issuedAt}`,
        ],
      })
    if (expirationTime && !isISO8601(expirationTime))
      throw new SiweInvalidMessageFieldError({
        field: 'expirationTime',
        metaMessages: [
          '- Expiration Time must be an ISO 8601 datetime string.',
          '- See https://www.iso.org/iso-8601-date-and-time-format.html',
          '',
          `Provided value: ${expirationTime}`,
        ],
      })
    if (notBefore && !isISO8601(notBefore))
      throw new SiweInvalidMessageFieldError({
        field: 'notBefore',
        metaMessages: [
          '- Not Before must be an ISO 8601 datetime string.',
          '- See https://www.iso.org/iso-8601-date-and-time-format.html',
          '',
          `Provided value: ${notBefore}`,
        ],
      })
    const statement = parameters.statement
    if (statement?.includes('\n'))
      throw new SiweInvalidMessageFieldError({
        field: 'statement',
        metaMessages: [
          "- Statement must not include '\\n'.",
          '',
          `Provided value: ${statement}`,
        ],
      })
  }

  // Construct message
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

  if (expirationTime) suffix += `\nExpiration Time: ${expirationTime}`
  if (notBefore) suffix += `\nNot Before: ${notBefore}`
  if (requestId) suffix += `\nRequest ID: ${requestId}`
  if (resources) {
    let content = '\nResources:'
    for (const resource of resources) {
      if (!isUri(resource))
        throw new SiweInvalidMessageFieldError({
          field: 'resources',
          metaMessages: [
            '- Every resource must be a RFC 3986 URI.',
            '- See https://www.rfc-editor.org/rfc/rfc3986',
            '',
            `Provided value: ${resource}`,
          ],
        })
      content += `\n- ${resource}`
    }
    suffix += content
  }

  return `${prefix}\n${suffix}`
}

const domainRegex = /^(?:(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63})$/
const nonceRegex = /^[a-zA-Z0-9]{8,}$/
const schemeRegex = /^([a-zA-Z][a-zA-Z0-9+-.]*)$/
