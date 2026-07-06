import type * as TokenId from 'ox/tempo/TokenId'
import type * as TransactionRequest from 'ox/tempo/TransactionRequest'

import type { writeSync } from '../../core/actions/contract/writeSync.js'
import type { UnionPick } from '../../core/internal/types.js'

export type { ReadParameters } from '../../core/actions/token/internal.js'

/**
 * Selects a TIP-20 token by `token`, which is either a TIP-20 token id or a
 * contract `address`.
 */
export type TokenParameter = {
  /** Token to operate on: a TIP-20 token id or a contract `address`. */
  token: TokenId.TokenIdOrAddress
}

export type TokenParameters = TokenParameter & {
  /**
   * Decimals used to convert between base units and the human-readable amount.
   * Inferred from the client's `tokens` array when `token` matches a declared
   * token; otherwise fetched from the token contract when needed.
   */
  decimals?: number | undefined
}

/** Transaction-override fields shared by Tempo write actions. */
export type WriteParameters = UnionPick<
  writeSync.Options,
  | 'account'
  | 'chain'
  | 'gas'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'throwOnReceiptRevert'
> &
  UnionPick<
    TransactionRequest.TransactionRequest,
    | 'feePayer'
    | 'feeToken'
    | 'keyAuthorization'
    | 'nonceKey'
    | 'validAfter'
    | 'validBefore'
  >
