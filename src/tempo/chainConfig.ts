import * as Hex from 'ox/Hex'
import { SignatureEnvelope, type TokenId } from 'ox/tempo'
import { getCode } from '../actions/public/getCode.js'
import { readContract } from '../actions/public/readContract.js'
import { verifyHash } from '../actions/public/verifyHash.js'
import { zeroAddress } from '../constants/address.js'
import { maxUint256 } from '../constants/number.js'
import type { Chain, ChainConfig as viem_ChainConfig } from '../types/chain.js'
import { isAddressEqual } from '../utils/address/isAddressEqual.js'
import { extendSchema } from '../utils/chain/defineChain.js'
import { defineTransaction } from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import { getAction } from '../utils/getAction.js'
import { keccak256 } from '../utils/hash/keccak256.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import * as Abis from './Abis.js'
import type { Account } from './Account.js'
import * as Addresses from './Addresses.js'
import * as Formatters from './Formatters.js'
import * as Concurrent from './internal/concurrent.js'
import * as Transaction from './Transaction.js'

const maxExpirySecs = 25

const keySignatureTypes = {
  0: 'secp256k1',
  1: 'p256',
  2: 'webAuthn',
} as const satisfies Record<number, SignatureEnvelope.Type>

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
    async (r, { phase }) => {
      const request = r as Transaction.TransactionRequest & {
        account?: Account | undefined
        chain?:
          | (Chain & { feeToken?: TokenId.TokenIdOrAddress | undefined })
          | undefined
      }

      // FIXME: node does not account for fee payer + key authorization combinartion; bump gas for now.
      if (phase === 'afterFillParameters') {
        if (
          request.feePayer &&
          request.keyAuthorization?.signature.type === 'webAuthn'
        )
          request.gas = (request.gas ?? 0n) + 20_000n
        return request as unknown as typeof r
      }

      // Use expiring nonces for concurrent transactions (TIP-1009).
      // When nonceKey is 'expiring', feePayer is specified, or concurrent requests
      // are detected, we use expiring nonces (nonceKey = uint256.max) with a
      // validBefore timestamp.
      const useExpiringNonce = await (async () => {
        if (request.nonceKey === 'expiring') return true
        if (request.feePayer && typeof request.nonceKey === 'undefined')
          return true
        const address = request.account?.address
        if (address && typeof request.nonceKey === 'undefined')
          return await Concurrent.detect(address)
        return false
      })()

      if (useExpiringNonce) {
        request.nonceKey = maxUint256
        request.nonce = 0
        if (typeof request.validBefore === 'undefined')
          request.validBefore = Math.floor(Date.now() / 1000) + maxExpirySecs
      } else if (typeof request.nonceKey !== 'undefined') {
        // Explicit nonceKey provided (2D nonce mode)
        request.nonce = typeof request.nonce === 'number' ? request.nonce : 0
      }

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
    if (typeof signature === 'string') {
      const envelope = (() => {
        try {
          return SignatureEnvelope.deserialize(signature)
        } catch {
          return undefined
        }
      })()
      if (!envelope) {
        return await getAction(
          client,
          verifyHash,
          'verifyHash',
        )({ ...parameters, chain: null })
      }

      if (envelope.type === 'keychain') {
        const innerHash = getKeychainHash({
          hash,
          userAddress: envelope.userAddress,
          version: envelope.version,
        })
        const accessKeyAddress = SignatureEnvelope.from(envelope, {
          payload: innerHash,
        }).keyId

        if (!isAddressEqual(envelope.userAddress, address)) return false
        if (!accessKeyAddress) return false

        const key = await readContract(client, {
          address: Addresses.accountKeychain,
          abi: Abis.accountKeychain,
          functionName: 'getKey',
          args: [address, accessKeyAddress],
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag,
        })

        if (key.keyId === zeroAddress || key.isRevoked) return false

        if (
          keySignatureTypes[
            key.signatureType as keyof typeof keySignatureTypes
          ] !== envelope.inner.type
        )
          return false

        if (
          key.expiry !== 0n &&
          key.expiry <= BigInt(Math.floor(Date.now() / 1000))
        )
          return false

        return SignatureEnvelope.verify(envelope.inner, {
          address: accessKeyAddress,
          payload: innerHash,
        })
      }

      if (envelope.type !== 'secp256k1') {
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

function getKeychainHash(parameters: {
  hash: `0x${string}`
  userAddress: `0x${string}`
  version?: 'v1' | 'v2' | undefined
}) {
  const { hash, userAddress, version } = parameters
  if (version === 'v2') return keccak256(Hex.concat('0x04', hash, userAddress))
  return hash
}
