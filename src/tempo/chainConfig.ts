import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import {
  MultisigConfig,
  MultisigOperation,
  SignatureEnvelope,
  type TokenId,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { getCode } from '../actions/public/getCode.js'
import { getTransaction } from '../actions/public/getTransaction.js'
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
  createMultisigStateResolver,
  getMultisigOwnerStates,
} from './internal/multisig.js'
import * as Transaction from './Transaction.js'

const maxExpirySecs = 25

// TODO: casting to satisfy viem – viem v3 to have more flexible serializer type.
const serializeTransaction = ((transaction, signature) =>
  Transaction.serialize(transaction, signature)) as SerializeTransactionFn

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
        hash?: Hex.Hex | undefined
        keyData?: Hex.Hex | undefined
        keyType?: 'p256' | 'secp256k1' | 'webAuthn' | undefined
        multisig?: Address | MultisigAccount | MultisigConfig.Config | undefined
        multisigOwnerStates?: Transaction.TransactionRequestTempo['multisigOwnerStates']
        signatures?: readonly unknown[] | undefined
      }

      if (request.hash) {
        if (!request.account || typeof request.account === 'string')
          throw new Error(
            'A local owner account is required to approve a stored multisig transaction.',
          )
        const transaction = await getAction(
          client,
          getTransaction,
          'getTransaction',
        )({ hash: request.hash })
        const operation =
          'multisig' in transaction
            ? (transaction.multisig as
                | MultisigOperation.TransactionOperation
                | undefined)
            : undefined
        if (!operation)
          throw new Error('Expected a multisig operation transaction.')
        const storedTransaction = TxEnvelopeTempo.deserialize(
          operation.transaction as never,
        )
        const hash = MultisigOperation.getHash({
          account: operation.account,
          configVersion: operation.configVersion,
          transaction: operation.transaction,
          type: 'transaction',
        })
        if (hash.toLowerCase() !== request.hash.toLowerCase())
          throw new Error('Multisig operation hash does not match transaction.')
        const ownerStates =
          request.account.source === 'multisig'
            ? await getMultisigOwnerStates(
                request.account as MultisigAccount,
                createMultisigStateResolver((account) =>
                  getAction(
                    client,
                    multisig.getConfig,
                    'getConfig',
                  )({
                    account,
                  }),
                ),
              )
            : []
        return {
          ...storedTransaction,
          from: operation.account,
          multisig: operation.init ? operation.config : operation.account,
          ...(ownerStates.length > 0 && {
            multisigOwnerStates: ownerStates,
          }),
          multisigVersion: operation.configVersion,
        } as unknown as typeof r
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

      // Native multisig (TIP-1061). The transaction sender is the stable
      // multisig address, not a signing account. Initial configs support
      // bootstrap; initialized accounts can be reconstructed from their
      // address and resolved through the multisig precompile.
      //
      // The config is taken from an explicit `multisig` field, or inferred from
      // a multisig account (so callers can just pass `account` to
      // `prepareTransactionRequest` without also passing `multisig`).
      const multisigIdentity = (() => {
        const multisig = request.multisig
        if (typeof multisig === 'string') return multisig
        if (multisig && 'source' in multisig)
          return multisig.config ?? multisig.address
        if (multisig) return multisig
        if (request.account?.source === 'multisig')
          return (
            (request.account as MultisigAccount).config ??
            request.account.address
          )
        return undefined
      })()
      if (multisigIdentity && typeof request.account === 'string')
        throw new Error(
          'A local owner account is required to approve a multisig transaction.',
        )
      let initializedMultisig = false
      if (multisigIdentity) {
        const initialConfig =
          typeof multisigIdentity === 'string'
            ? undefined
            : MultisigConfig.from(multisigIdentity)
        const multisigAddress =
          typeof multisigIdentity === 'string'
            ? multisigIdentity
            : MultisigConfig.getAddress(initialConfig!)
        request.multisig = initialConfig ?? multisigIdentity
        request.from = multisigAddress
        // Key types are not part of the config, so conservatively model every
        // approval as a maximum-size WebAuthn signature.
        if (typeof request.keyType === 'undefined') {
          request.keyType = 'webAuthn'
          if (typeof request.keyData === 'undefined') request.keyData = '0x0578'
        }
        const getState = createMultisigStateResolver((account) =>
          getAction(client, multisig.getConfig, 'getConfig')({ account }),
        )
        const ownerStates =
          request.account?.source === 'multisig'
            ? getMultisigOwnerStates(
                request.account as MultisigAccount,
                getState,
              )
            : undefined
        const state = await getState(multisigAddress)
        initializedMultisig = state.initialized
        if (!initialConfig && !state.initialized)
          throw new Error(
            'Cannot prepare an uninitialized multisig account from an address. Provide its initial config instead.',
          )
        if (typeof request.multisigVersion === 'undefined')
          request.multisigVersion = state.version
        const authorizationSignature = request.keyAuthorization?.signature
        if (
          authorizationSignature?.type === 'multisig' &&
          typeof authorizationSignature.init !== 'undefined'
        )
          request.keyAuthorization = {
            ...request.keyAuthorization!,
            signature: SignatureEnvelope.from({
              initialConfig: authorizationSignature.init,
              signatures: authorizationSignature.signatures,
            }),
          }
        const keyAuthorizationSignature = request.keyAuthorization?.signature
        const keyAuthorizationInitializes =
          keyAuthorizationSignature?.type === 'multisig' &&
          typeof keyAuthorizationSignature.init !== 'undefined'
        if (initialConfig && !keyAuthorizationInitializes)
          request.multisigInit = {
            salt: initialConfig.salt ?? MultisigConfig.zeroSalt,
            threshold: Number(initialConfig.threshold),
            owners: initialConfig.owners.map((owner) => ({
              owner: owner.owner,
              weight: Number(owner.weight),
            })),
          }
        if (ownerStates) {
          const states = await ownerStates
          if (states.length > 0) request.multisigOwnerStates = states
        }
        // A signing account that differs from the root multisig is not the
        // sender. Drop it so core fills the root account's nonce and fees.
        if (
          request.account?.source !== 'multisig' ||
          !isAddressEqual(request.account.address, multisigAddress)
        )
          delete request.account
      }

      const coordinatedMultisig =
        !!multisigIdentity &&
        initializedMultisig &&
        (client.transport as { multisig?: boolean }).multisig === true

      // Register concurrency before account preparation performs storage or
      // network I/O so overlapping requests cannot miss each other.
      const useExpiringNonce = await (async () => {
        if (request.nonceKey === 'expiring' || request.nonceKey === maxUint256)
          return true
        if (typeof request.nonceKey !== 'undefined') return false
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

      if (coordinatedMultisig && typeof request.nonceKey === 'undefined') {
        // A random nonce lane lets a stored approval ceremony remain valid
        // indefinitely without blocking other pending operations.
        request.nonceKey = Hex.toBigInt(Hex.random(31)) + 1n
        request.nonce = 0
      } else if (useExpiringNonce) {
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
    transaction: serializeTransaction,
    async transactionEnvelope({ serializedTransaction, transaction }) {
      const request = transaction as Transaction.TransactionSerializableTempo
      if (!request.multisig) return serializedTransaction
      try {
        SignatureEnvelope.deserialize(serializedTransaction)
      } catch {
        return serializedTransaction
      }
      return await serializeTransaction({
        ...request,
        signatures: [...(request.signatures ?? []), serializedTransaction],
      } as never)
    },
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
