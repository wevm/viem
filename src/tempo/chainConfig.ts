import type { TokenId } from 'ox/tempo'
import type { Chain, ChainConfig as viem_ChainConfig } from '../types/chain.js'
import { extendSchema } from '../utils/chain/defineChain.js'
import { defineTransaction } from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { Account } from './Account.js'
import * as Formatters from './Formatters.js'
import * as NonceKeyStore from './internal/nonceKeyStore.js'
import * as Transaction from './Transaction.js'

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
      chain?:
        | (Chain & { feeToken?: TokenId.TokenIdOrAddress | undefined })
        | undefined
    }

    request.nonceKey = (() => {
      if (typeof request.nonceKey !== 'undefined') return request.nonceKey

      const address = request.account?.address ?? request.from
      if (!address) return undefined
      if (!request.chain) return undefined
      const nonceKey = NonceKeyStore.getNonceKey(NonceKeyStore.store, {
        address,
        chainId: request.chain.id,
      })

      if (nonceKey === 0n) return undefined
      return nonceKey
    })()

    request.nonce = (() => {
      if (typeof request.nonce === 'number') return request.nonce
      // TODO: remove this line once `eth_fillTransaction` supports nonce keys.
      if (request.nonceKey) return 0
      return undefined
    })()

    if (!request.feeToken && request.chain?.feeToken)
      request.feeToken = request.chain.feeToken

    return request as unknown as typeof r
  },
  serializers: {
    // TODO: casting to satisfy viem – viem v3 to have more flexible serializer type.
    transaction: ((transaction, signature) =>
      Transaction.serialize(transaction, signature)) as SerializeTransactionFn,
  },
} as const satisfies viem_ChainConfig & { blockTime: number }

export type ChainConfig = typeof chainConfig
