import { SignatureEnvelope, type TokenId } from 'ox/tempo'
import { getCode } from '../actions/public/getCode.js'
import { verifyHash } from '../actions/public/verifyHash.js'
import type { Chain, ChainConfig as viem_ChainConfig } from '../types/chain.js'
import { extendSchema } from '../utils/chain/defineChain.js'
import { defineTransaction } from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import { getAction } from '../utils/getAction.js'
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
  prepareTransactionRequest: [
    async (r) => {
      const request = r as Transaction.TransactionRequest & {
        account?: Account | undefined
        chain?:
          | (Chain & { feeToken?: TokenId.TokenIdOrAddress | undefined })
          | undefined
      }

      request.nonceKey = (() => {
        if (
          typeof request.nonceKey !== 'undefined' &&
          request.nonceKey !== 'random'
        )
          return request.nonceKey

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
    { runAt: ['beforeFillTransaction', 'afterFillParameters'] },
  ],
  serializers: {
    // TODO: casting to satisfy viem – viem v3 to have more flexible serializer type.
    transaction: ((transaction, signature) =>
      Transaction.serialize(transaction, signature)) as SerializeTransactionFn,
  },
  async verifyHash(client, parameters) {
    const { address, hash, signature } = parameters

    // `verifyHash` supports "signature envelopes" (a Tempo proposal) to natively verify arbitrary
    // envelope-compatible (WebAuthn, P256, etc.) signatures.
    // We can directly verify stateless, non-keychain signature envelopes without a
    // network request to the chain.
    if (
      typeof signature === 'string' &&
      signature.endsWith(SignatureEnvelope.magicBytes.slice(2))
    ) {
      const envelope = SignatureEnvelope.deserialize(signature)
      if (envelope.type !== 'keychain') {
        const code = await getCode(client, {
          address,
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag,
        } as never)
        // Check if EOA, if not, we want to go down the ERC-1271 flow.
        if (
          // not a contract (EOA)
          !code ||
          // default delegation (tempo EOA)
          code === '0xef01007702c00000000000000000000000000000000000'
        )
          return SignatureEnvelope.verify(envelope, {
            address,
            payload: hash,
          })
      }
    }

    return await getAction(
      client,
      verifyHash,
      'verifyHash',
    )({ ...parameters, chain: null })
  },
} as const satisfies viem_ChainConfig & { blockTime: number }

export type ChainConfig = typeof chainConfig
