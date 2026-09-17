import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import { MultisigConfig, SignatureEnvelope, type TokenId } from 'ox/tempo'
import { getCode } from '../actions/public/getCode.js'
import { verifyHash } from '../actions/public/verifyHash.js'
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
import type { Account, MultisigAccount } from './Account.js'
import { getMetadata } from './actions/accessKey.js'
import * as multisig from './actions/multisig.js'
import * as Formatters from './Formatters.js'
import type { Hardfork } from './Hardfork.js'
import * as Concurrent from './internal/concurrent.js'
import {
  assertMultisigConfig,
  getMultisigSimulation,
} from './internal/multisig.js'
import * as Transaction from './Transaction.js'

const maxExpirySecs = 25

/** Returns random past seconds to distinguish otherwise-identical expiring transactions. */
function randomValidAfter(): number {
  const now = BigInt(Math.floor(Date.now() / 1_000))
  const latest = now - 60n
  if (latest <= 0n) return 0
  return Number(BigInt(Hex.random(8)) % latest)
}

export const chainConfig = {
  blockTime: 1_000,
  extendSchema: extendSchema<{
    feeToken?: TokenId.TokenIdOrAddress | undefined
    hardfork?: Hardfork | undefined
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
    async (r, { client, phase }) => {
      const request = r as Transaction.TransactionRequest & {
        account?: Account | MultisigAccount | undefined
        chainId?: number | undefined
        chain?:
          | (Chain & {
              feeToken?: TokenId.TokenIdOrAddress | undefined
            })
          | undefined
        feePayerSignature?: Transaction.TransactionSerializableTempo['feePayerSignature']
        from?: Address | undefined
        keyData?: Hex.Hex | undefined
        keyType?: 'p256' | 'secp256k1' | 'webAuthn' | undefined
        signatures?: readonly unknown[] | undefined
      }

      // FIXME: node estimates gas with secp256k1 dummy sig + null feePayerSignature.
      // Actual tx has larger keychain/webAuthn sigs + real fee payer sig, costing more intrinsic gas.
      if (phase === 'afterFillParameters') {
        // Fee payer signature covers the gas limit, so the relay must set it before signing and Viem must not change it afterward.
        if (
          typeof request.gas !== 'undefined' &&
          request.feePayer &&
          !request.feePayerSignature
        ) {
          if (request.keyAuthorization?.signature.type === 'webAuthn')
            request.gas = (request.gas ?? 0n) + 20_000n
          else if (request.account?.source === 'accessKey')
            request.gas = (request.gas ?? 0n) + 10_000n
        }

        return request as unknown as typeof r
      }

      const multisigAccount =
        request.account?.source === 'multisig'
          ? (request.account as MultisigAccount)
          : undefined
      const identity =
        request.multisig ??
        (multisigAccount?.config
          ? { account: multisigAccount.address, config: multisigAccount.config }
          : undefined)
      if (multisigAccount && !identity)
        throw new Error(
          'Current multisig config is required. Provide it in the multisig request.',
        )
      if (identity) {
        if (
          multisigAccount &&
          multisigAccount.address.toLowerCase() !==
            identity.account.toLowerCase()
        )
          throw new Error(
            'Multisig account does not match the transaction sender.',
          )
        request.multisig = {
          account: identity.account,
          config: MultisigConfig.from(identity.config),
        }
        const commitment = await getAction(
          client,
          multisig.getConfigCommitment,
          'getConfigCommitment',
        )({ account: identity.account })
        assertMultisigConfig(request.multisig, commitment)
        request.from = identity.account
        request.multisigSimulation ??= getMultisigSimulation(
          request.multisig.config,
        )
        if (!multisigAccount) delete request.account
      }

      // Register concurrency before account preparation performs storage or
      // network I/O so overlapping requests cannot miss each other.
      const useExpiringNonce = await (async () => {
        if (request.nonceKey === 'expiring' || request.nonceKey === maxUint256)
          return true
        if (identity) return false
        if (request.feePayer && typeof request.nonceKey === 'undefined')
          return true
        const account = request.account as
          | Account
          | MultisigAccount
          | Address
          | undefined
        const address = typeof account === 'string' ? account : account?.address
        if (address && typeof request.nonceKey === 'undefined')
          return await Concurrent.detect(address.toLowerCase())
        return false
      })()

      if (useExpiringNonce) {
        request.nonceKey = maxUint256
        request.nonce = 0
        if (typeof request.validAfter === 'undefined')
          request.validAfter = randomValidAfter()
        if (typeof request.validBefore === 'undefined')
          request.validBefore = Math.floor(Date.now() / 1000) + maxExpirySecs
      } else if (typeof request.nonceKey !== 'undefined') {
        request.nonce = typeof request.nonce === 'number' ? request.nonce : 0
      }

      if (
        !request.keyAuthorization &&
        request.account?.source === 'accessKey'
      ) {
        const keyAuthorizationManager = request.account.keyAuthorizationManager
        if (keyAuthorizationManager) {
          const chainId = request.chainId ?? request.chain?.id
          if (typeof chainId !== 'undefined') {
            const address = request.account.address
            const accessKey = request.account.accessKeyAddress
            const key = { address, accessKey, chainId }
            const keyAuthorization = await keyAuthorizationManager.get(key)

            if (keyAuthorization) {
              const now = BigInt(Math.floor(Date.now() / 1000))
              if (
                keyAuthorization.expiry != null &&
                BigInt(keyAuthorization.expiry) <= now
              ) {
                await keyAuthorizationManager.remove(key)
              } else {
                const metadata = await getAction(
                  client,
                  getMetadata,
                  'getMetadata',
                )({ account: address, accessKey })

                if (
                  isAddressEqual(metadata.address, accessKey) &&
                  !metadata.isRevoked &&
                  metadata.expiry > now
                )
                  await keyAuthorizationManager.remove(key)
                else request.keyAuthorization = keyAuthorization
              }
            }
          }
        }
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
    const { address, hash, signature, mode } = parameters

    const envelope = (() => {
      if (typeof signature !== 'string') return
      try {
        return SignatureEnvelope.deserialize(signature)
      } catch {
        return undefined
      }
    })()

    // `verifyHash` supports "signature envelopes" (a Tempo proposal) to natively verify arbitrary
    // envelope-compatible (WebAuthn, P256, etc.) signatures.
    if (envelope) {
      // Access key (keychain) signature verification: check the key is
      // authorized, not expired, and not revoked on the AccountKeychain.
      if (envelope?.type === 'keychain' && mode === 'allowAccessKey') {
        // For v2 keychain envelopes, the inner signature signs
        // keccak256(0x04 || hash || userAddress).
        const innerPayload =
          envelope.version === 'v2'
            ? keccak256(Hex.concat('0x04', hash, address))
            : hash

        const accessKeyAddress = (() => {
          try {
            return SignatureEnvelope.extractAddress({
              payload: innerPayload,
              signature: envelope.inner,
            })
          } catch {
            return undefined
          }
        })()
        if (!accessKeyAddress) return false

        const keyInfo = await getMetadata(client, {
          account: address,
          accessKey: accessKeyAddress,
          blockHash: parameters.blockHash,
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag,
          requireCanonical: parameters.requireCanonical,
        } as never)

        if (keyInfo.isRevoked) return false
        if (keyInfo.expiry <= BigInt(Math.floor(Date.now() / 1000)))
          return false
        return SignatureEnvelope.verify(envelope.inner, {
          address: accessKeyAddress,
          payload: innerPayload,
        })
      }

      // Stateless, non-keychain signature envelopes (P256, WebAuthn) can be
      // verified directly without a network request.
      if (envelope.type === 'p256' || envelope.type === 'webAuthn') {
        const code = await getCode(client, {
          address,
          blockHash: parameters.blockHash,
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag,
          requireCanonical: parameters.requireCanonical,
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
