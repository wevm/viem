import type { Address } from 'abitype'

import type { Hex } from '../types/misc.js'
import { stringify } from '../utils/stringify.js'

import { BaseError } from './base.js'
import { getUrl } from './utils.js'

export type OffchainLookupErrorType = OffchainLookupError & {
  name: 'OffchainLookupError'
}
export class OffchainLookupError extends BaseError {
  constructor({
    callbackSelector,
    cause,
    data,
    extraData,
    sender,
    urls,
  }: {
    callbackSelector: Hex
    cause: BaseError
    data: Hex
    extraData: Hex
    sender: Address
    urls: readonly string[]
  }) {
    super(
      cause.shortMessage ||
        'An error occurred while fetching for an offchain result.',
      {
        cause,
        metaMessages: [
          ...(cause.metaMessages || []),
          cause.metaMessages?.length ? '' : [],
          'Offchain Gateway Call:',
          urls && [
            '  Gateway URL(s):',
            ...urls.map((url) => `    ${getUrl(url)}`),
          ],
          `  Sender: ${sender}`,
          `  Data: ${data}`,
          `  Callback selector: ${callbackSelector}`,
          `  Extra data: ${extraData}`,
        ].flat(),
        name: 'OffchainLookupError',
      },
    )
  }
}

export type OffchainLookupResponseMalformedErrorType =
  OffchainLookupResponseMalformedError & {
    name: 'OffchainLookupResponseMalformedError'
  }
export class OffchainLookupResponseMalformedError extends BaseError {
  constructor({ result, url }: { result: any; url: string }) {
    super(
      'Offchain gateway response is malformed. Response data must be a hex value.',
      {
        metaMessages: [
          `Gateway URL: ${getUrl(url)}`,
          `Response: ${stringify(result)}`,
        ],
        name: 'OffchainLookupResponseMalformedError',
      },
    )
  }
}

/** @internal */
export type OffchainLookupSenderMismatchErrorType =
  OffchainLookupSenderMismatchError & {
    name: 'OffchainLookupSenderMismatchError'
  }
export class OffchainLookupSenderMismatchError extends BaseError {
  constructor({ sender, to }: { sender: Address; to: Address }) {
    super(
      'Reverted sender address does not match target contract address (`to`).',
      {
        metaMessages: [
          `Contract address: ${to}`,
          `OffchainLookup sender address: ${sender}`,
        ],
        name: 'OffchainLookupSenderMismatchError',
      },
    )
  }
}
