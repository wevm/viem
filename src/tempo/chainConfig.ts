import type { TokenId } from 'ox/tempo'
import * as Hex from 'ox/Hex'
import type { ChainConfig as viem_ChainConfig } from '../types/chain.js'
import { defineTransaction } from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { Account } from './Account.js'
import * as Formatters from './Formatters.js'
import * as Transaction from './Transaction.js'
import { extendSchema } from '../utils/chain/defineChain.js'

// TODO(tempo): scope by address+chainId
const nonceKeyManager = {
  counter: 0,
  resetScheduled: false,
  reset() {
    this.counter = 0
    this.resetScheduled = false
  },
  get() {
    if (!this.resetScheduled) {
      this.resetScheduled = true
      queueMicrotask(() => this.reset())
    }
    const count = this.counter
    this.counter++
    if (count === 0) return 0n
    return Hex.toBigInt(Hex.random(6))
  },
}

export const chainConfig = {
  blockTime: 1_000,
  extendSchema: extendSchema<{
    feeToken?: TokenId.TokenIdOrAddress | undefined
  }>(),
  formatters: {
    transaction: defineTransaction({
      exclude: ['aaAuthorizationList' as never],
      format: Formatters.formatTransaction,
    }),
    transactionReceipt: defineTransactionReceipt({
      format: Formatters.formatTransactionReceipt,
    }),
    transactionRequest: defineTransactionRequest({
      format: Formatters.formatTransactionRequest,
    }),
  },
  async prepareTransactionRequest(r) {
    const request = r as Transaction.TransactionRequest & {
      account?: Account | undefined
    }
    const nonceKey = (() => {
      if (typeof request.nonceKey !== 'undefined') return request.nonceKey
      const nonceKey = nonceKeyManager.get()
      if (nonceKey === 0n) return undefined
      return nonceKey
    })()

    const nonce = (() => {
      if (typeof request.nonce === 'number') return request.nonce
      // TODO: remove this line once `eth_fillTransaction` supports nonce keys.
      if (nonceKey) return 0
      return undefined
    })()

    const keyAuthorization =
      (await request.account?.storage?.getItem('pendingKeyAuthorization')) ??
      undefined
    if (keyAuthorization && !request.keyAuthorization)
      await request.account?.storage?.removeItem('pendingKeyAuthorization')

    return {
      ...request,
      keyAuthorization,
      nonce,
      nonceKey,
    } as unknown as typeof r
  },
  serializers: {
    // TODO: casting to satisfy viem – viem v3 to have more flexible serializer type.
    transaction: ((transaction, signature) =>
      Transaction.serialize(transaction, signature)) as SerializeTransactionFn,
  },
} as const satisfies viem_ChainConfig & { blockTime: number }

export type ChainConfig = typeof chainConfig
