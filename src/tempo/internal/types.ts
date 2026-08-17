import type { Address } from 'ox'

import type { writeSync } from '../../core/actions/contract/writeSync.js'
import type { TransactionRequest } from '../chainConfig.js'
import type { UnionPick } from '../../core/internal/types.js'

export type {
  ReadParameters,
  WriteSyncParameters,
} from '../../core/actions/token/internal.js'

/** Selects a TIP-20 token by its contract `address`. */
export type TokenParameter = {
  /** Token to operate on: a TIP-20 contract `address`. */
  token: Address.Address
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
    TransactionRequest,
    | 'feePayer'
    | 'feeToken'
    | 'keyAuthorization'
    | 'nonceKey'
    | 'validAfter'
    | 'validBefore'
  >
