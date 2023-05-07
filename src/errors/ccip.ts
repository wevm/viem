import type { Address } from 'abitype'

import type { Hex } from '../types/misc.js'

import { BaseError } from './base.js'
import { getUrl } from './utils.js'

export class OffchainLookupError extends BaseError {
  override name = 'OffchainLookupError'
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
      },
    )
  }
}

export class OffchainLookupResponseMalformedError extends BaseError {
  override name = 'OffchainLookupResponseMalformedError'
  constructor({ result, url }: { result: any; url: string }) {
    super(
      'Offchain gateway response is malformed. Response data must be a hex value.',
      {
        metaMessages: [
          `Gateway URL: ${getUrl(url)}`,
          `Response: ${JSON.stringify(result)}`,
        ],
      },
    )
  }
}

export class OffchainLookupSenderMismatchError extends BaseError {
  override name = 'OffchainLookupSenderMismatchError'
  constructor({ sender, to }: { sender: Address; to: Address }) {
    super(
      'Reverted sender address does not match target contract address (`to`).',
      {
        metaMessages: [
          `Contract address: ${to}`,
          `OffchainLookup sender address: ${sender}`,
        ],
      },
    )
  }
}
