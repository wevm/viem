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
import * as Formatters from './Formatters.js'
import type { Hardfork } from './Hardfork.js'
import * as Concurrent from './internal/concurrent.js'
import * as Transaction from './Transaction.js'

const maxExpirySecs = 25

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
        from?: Address | undefined
        multisig?: MultisigConfig.Config | undefined
        signatures?: readonly unknown[] | undefined
      }

      // FIXME: node estimates gas with secp256k1 dummy sig + null feePayerSignature.
      // Actual tx has larger keychain/webAuthn sigs + real fee payer sig, costing more intrinsic gas.
      if (phase === 'afterFillParameters') {
        if (request.feePayer) {
          if (request.keyAuthorization?.signature.type === 'webAuthn')
            request.gas = (request.gas ?? 0n) + 20_000n
          else if (request.account?.source === 'accessKey')
            request.gas = (request.gas ?? 0n) + 10_000n
        }

        return request as unknown as typeof r
      }

      // Native multisig (TIP-1061). The transaction sender is the derived
      // multisig account, not a signing account (owner accounts only contribute
      // approvals later via `signTransaction`). Derive the sender from the
      // config; core fills nonce/gas/fees for it via `request.from`, and the
      // serializer auto-detects bootstrap (`init`) from `nonce == 0`.
      //
      // The config is taken from an explicit `multisig` field, or inferred from
      // a multisig account (so callers can just pass `account` to
      // `prepareTransactionRequest` without also passing `multisig`).
      const multisig =
        request.multisig ??
        (request.account?.source === 'multisig'
          ? (request.account as MultisigAccount).config
          : undefined)
      if (multisig) {
        const config = MultisigConfig.from(multisig)
        request.multisig = config
        request.from = MultisigConfig.getAddress(config)
        request.multisigInit = {
          salt: config.salt ?? MultisigConfig.zeroSalt,
          threshold: Number(config.threshold),
          owners: config.owners.map((owner) => ({
            owner: owner.owner,
            weight: Number(owner.weight),
          })),
        }
        request.multisigSignatureCount ??= inferMultisigSignatureCount(config)
        // A non-multisig `account` (e.g. the client's default) isn't the sender,
        // so drop it: core then fills nonce/gas/fees for the multisig sender via
        // `request.from`. A multisig account *is* the sender — keep it so the
        // prepared request can be sent without re-passing `account`.
        if (request.account?.source !== 'multisig') delete request.account
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

      // Use expiring nonces for concurrent transactions (TIP-1009).
      // When nonceKey is 'expiring', feePayer is specified, or concurrent requests
      // are detected, we use expiring nonces (nonceKey = uint256.max) with a
      // validBefore timestamp.
      const useExpiringNonce = await (async () => {
        if (request.nonceKey === 'expiring') return true
        if (multisig) return false
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
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag,
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

function inferMultisigSignatureCount(config: MultisigConfig.Config) {
  const threshold = Number(config.threshold)
  const weights = config.owners
    .map((owner) => Number(owner.weight))
    .sort((a, b) => b - a)
  let total = 0
  for (const [index, weight] of weights.entries()) {
    total += weight
    if (total >= threshold) return index + 1
  }
  return weights.length
}
