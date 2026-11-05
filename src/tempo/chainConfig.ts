import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import {
  AccountConfig,
  AccountOperation,
  type AccountSimulation,
  KeyAuthorization,
  SignatureEnvelope,
  type TokenId,
} from 'ox/tempo'
import { getCode } from '../actions/public/getCode.js'
import { getTransaction } from '../actions/public/getTransaction.js'
import { readContract } from '../actions/public/readContract.js'
import { verifyHash } from '../actions/public/verifyHash.js'
import type { Client } from '../clients/createClient.js'
import { maxUint256 } from '../constants/number.js'
import { BaseError } from '../errors/base.js'
import { ContractFunctionRevertedError } from '../errors/contract.js'
import type { Chain, ChainConfig as viem_ChainConfig } from '../types/chain.js'
import type { RpcBlock } from '../types/rpc.js'
import { isAddressEqual } from '../utils/address/isAddressEqual.js'
import { extendSchema } from '../utils/chain/defineChain.js'
import { defineTransaction } from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import { getAction } from '../utils/getAction.js'
import { keccak256 } from '../utils/hash/keccak256.js'
import type { SerializeTransactionFn } from '../utils/transaction/serializeTransaction.js'
import type { Account, ConfigurableAccount } from './Account.js'
import {
  getMetadata,
  verifyHash as verifyAccessKey,
} from './actions/accessKey.js'
import {
  getConfig,
  getConfigCommitment,
  verifyHash as verifyConfigurableAccount,
} from './actions/accounts.js'
import * as Formatters from './Formatters.js'
import type { Hardfork } from './Hardfork.js'
import * as Concurrent from './internal/concurrent.js'
import { transactionReplacement } from './internal/replacement.js'
import type * as KeyAuthorizationManager from './KeyAuthorizationManager.js'
import * as Transaction from './Transaction.js'

/** Default distance, in seconds, of a generated expiring nonce `validBefore`. Stays under the 300-second limit to allow for clock skew. */
const expiringNonceExpiry = 270

// TODO: casting to satisfy viem – viem v3 to have more flexible serializer type.
const serializeTransaction = ((transaction, signature) =>
  Transaction.serialize(transaction, signature)) as SerializeTransactionFn

// The base formatters decode nonces as safe integers and throw on Tempo expiring nonces (random
// u64 values), so Tempo formats every transaction itself, including those inside blocks.
export const chainConfig = {
  blockTime: 1_000,
  extendSchema: extendSchema<{
    feeToken?: TokenId.TokenIdOrAddress | undefined
    hardfork?: Hardfork | undefined
  }>(),
  formatters: {
    block: {
      format: (block: RpcBlock) => Formatters.formatBlock(block),
      type: 'block' as const,
    },
    transaction: {
      ...defineTransaction({
        exclude: ['aaAuthorizationList' as never],
        format: Formatters.formatTransaction,
      }),
      format: (transaction: Transaction.TransactionRpc) =>
        Formatters.formatTransaction(transaction),
    },
    transactionReceipt: defineTransactionReceipt({
      format: Formatters.formatTransactionReceipt,
    }),
    transactionRequest: defineTransactionRequest({
      format: Formatters.formatTransactionRequest,
    }),
  },
  prepareTransactionRequest: [
    async (r, { client, error, phase }) => {
      const request = r as Transaction.TransactionRequest & {
        account?: Account | ConfigurableAccount | undefined
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
        keyType?: 'configurable' | 'p256' | 'secp256k1' | 'webAuthn' | undefined
        accountSimulation?: AccountSimulation.Spec | undefined
        keyAuthorizationSimulation?: AccountSimulation.Spec | undefined
        owner?: Account | ConfigurableAccount | Address | undefined
        parameters?: readonly string[] | undefined
        signatures?: readonly unknown[] | undefined
      }

      // The node refuses an authorization of a registered key, so the fill retries without it.
      if (phase === 'afterFillTransactionError') {
        const refused =
          error instanceof BaseError &&
          error.walk((cause) =>
            (cause as BaseError).details?.includes('KeyAlreadyExists'),
          )
        const pending = refused ? await getPending(request) : undefined
        if (!pending) return undefined
        await pending.manager.remove(pending.key)
        const { keyAuthorization: _, ...retry } = request
        return retry as typeof r
      }

      // Without a successful fill, the node has not checked the attached authorization.
      if (phase === 'beforeFillParameters') {
        if (
          typeof request.gas !== 'undefined' ||
          !request.parameters?.includes('gas')
        )
          return request as unknown as typeof r
        const pending = await getPending(request)
        if (pending && (await isRegistered(client, pending.key))) {
          await pending.manager.remove(pending.key)
          delete request.keyAuthorization
        }
        return request as unknown as typeof r
      }

      if (request.hash) {
        // A configurable access key (TIP-1111) approves as its delegate, for its parent.
        const local = (() => {
          const account = request.account
          if (!account || typeof account === 'string') return undefined
          if (account.source === 'configurable')
            return account as ConfigurableAccount
          if (account.source === 'accessKey')
            return (account as { delegate?: ConfigurableAccount | undefined })
              .delegate
          return undefined
        })()
        if (!request.account || typeof request.account === 'string' || !local)
          throw new Error(
            'A local configurable account is required to approve a stored configurable account transaction.',
          )
        if (!request.owner || typeof request.owner === 'string')
          throw new Error(
            'A local owner account is required to approve a stored configurable account transaction.',
          )
        if (request.owner.source !== 'root')
          throw new Error(
            'A Tempo owner account is required to approve a stored configurable account transaction.',
          )
        const transaction = await getAction(
          client,
          getTransaction,
          'getTransaction',
        )({ hash: request.hash })
        const operation =
          'operation' in transaction
            ? (transaction.operation as
                | AccountOperation.TransactionOperation
                | undefined)
            : undefined
        if (!operation)
          throw new Error('Expected an account operation transaction.')
        const parent = local === request.account ? undefined : request.account
        if (
          !isAddressEqual(operation.account, local.address) ||
          (parent
            ? !operation.userAddress ||
              !isAddressEqual(operation.userAddress, parent.address)
            : !!operation.userAddress)
        )
          throw new Error(
            'Account operation account does not match the requested account.',
          )
        const storedTransaction = Transaction.deserialize(
          operation.transaction as Transaction.TransactionSerializedTempo,
        )
        const hash = AccountOperation.getHash({
          account: operation.account,
          config: operation.config,
          transaction: operation.transaction,
          type: 'transaction',
          userAddress: operation.userAddress,
        })
        if (hash.toLowerCase() !== request.hash.toLowerCase())
          throw new Error('Account operation hash does not match transaction.')
        return {
          ...storedTransaction,
          // Serialized zero values must not trigger a new fill of an approved transaction.
          gas: storedTransaction.gas ?? 0n,
          maxFeePerGas: storedTransaction.maxFeePerGas ?? 0n,
          maxPriorityFeePerGas: storedTransaction.maxPriorityFeePerGas ?? 0n,
          account: request.account,
          from: operation.userAddress ?? operation.account,
          accountSimulation: {
            ...getAccountSimulation({ config: operation.config, local }),
            ...(parent ? { signer: local.address } : {}),
          },
          owner: request.owner,
        } as unknown as typeof r
      }

      // FIXME: node estimates gas with secp256k1 dummy sig + null feePayerSignature.
      // Actual tx has larger keychain/webAuthn sigs + real fee payer sig, costing more intrinsic gas.
      if (phase === 'afterFillParameters') {
        // Fee payer signature covers the gas limit, so the relay must set it before signing and Viem must not change it afterward.
        // Owner approvals also cover it, so a request carrying them keeps its gas.
        const approved =
          Array.isArray((request as { signatures?: unknown }).signatures) &&
          (request as { signatures: readonly unknown[] }).signatures.length > 0
        if (
          typeof request.gas !== 'undefined' &&
          request.feePayer &&
          !request.feePayerSignature &&
          !approved
        ) {
          // The fill omits the fee payer's signature and fee token (85 bytes), which count toward intrinsic gas,
          // and, from T14, the cold access (2,600 gas) of the fee payer's account.
          request.gas = (request.gas ?? 0n) + feePayerGas
          if (request.keyAuthorization?.signature.type === 'webAuthn')
            request.gas = (request.gas ?? 0n) + 20_000n
          else if (request.account?.source === 'accessKey')
            request.gas = (request.gas ?? 0n) + 10_000n
        }

        return request as unknown as typeof r
      }

      const configurableIdentity = (() => {
        if (request.account?.source === 'configurable')
          return {
            account: request.account.address,
            config: (request.account as ConfigurableAccount).config,
            local: request.account as ConfigurableAccount,
          }
        return undefined
      })()
      // A configurable account acting as an access key (TIP-1111).
      const delegate =
        request.account?.source === 'accessKey'
          ? request.account.delegate
          : undefined
      if (request.owner && !configurableIdentity && !delegate)
        throw new Error(
          'A configurable account is required when an owner is provided.',
        )
      if (request.owner && typeof request.owner === 'string')
        throw new Error(
          'A local owner account is required to approve a configurable account transaction.',
        )
      if (request.owner && request.owner.source !== 'root')
        throw new Error(
          'A Tempo owner account is required to approve a configurable account transaction.',
        )
      const coordinated =
        (!!configurableIdentity || !!delegate) &&
        !!request.owner &&
        (client.transport as { accounts?: boolean }).accounts === true
      if (configurableIdentity) {
        const { account, local } = configurableIdentity
        if (!configurableIdentity.config && !coordinated)
          throw new Error(
            'An account config is required to prepare a transaction.',
          )
        const config =
          configurableIdentity.config ??
          (await getAction(
            client,
            getConfig,
            'getConfig',
          )({ address: account }))
        if (!config)
          throw new Error(
            `No current account config is cached for account ${account}. Provide the current config.`,
          )
        request.from = account
        request.accountSimulation = getAccountSimulation({
          config,
          local,
        })
      }
      if (delegate) {
        const config =
          delegate.config ??
          ((client.transport as { accounts?: boolean }).accounts === true
            ? await getAction(
                client,
                getConfig,
                'getConfig',
              )({ address: delegate.address })
            : undefined)
        if (!config)
          throw new Error(
            'An account config is required to prepare a transaction.',
          )
        // The node models the delegate's owner quorum inside a keychain signature.
        request.accountSimulation = {
          ...getAccountSimulation({ config, local: delegate }),
          signer: delegate.address,
        }
      }

      // Detect concurrency before further I/O so overlapping requests register in the same tick.
      if (coordinated && typeof request.nonceKey === 'undefined') {
        // A random nonce lane lets a stored approval ceremony remain valid
        // indefinitely without blocking other pending operations.
        request.nonceKey = Hex.toBigInt(Hex.random(31)) + 1n
        request.nonce = 0
      } else if (await useExpiringNonce(request, !!configurableIdentity)) {
        request.nonceKey = maxUint256
        // A random discriminator keeps otherwise identical expiring transactions distinct.
        // 48 bits stay within `Number.MAX_SAFE_INTEGER`.
        request.nonce ??= Hex.toNumber(Hex.random(6))
        if (typeof request.validBefore === 'undefined')
          request.validBefore =
            Math.floor(Date.now() / 1000) + expiringNonceExpiry
      } else if (
        typeof request.nonceKey !== 'undefined' &&
        // Nonce key 0 is the protocol nonce, so core fills it like an Ethereum nonce.
        BigInt(request.nonceKey) !== 0n
      ) {
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
              } else if (
                // The fill checks the authorization, so it needs no separate read.
                (request.parameters?.includes('gas') &&
                  typeof request.gas === 'undefined') ||
                !(await isRegistered(client, key))
              )
                request.keyAuthorization = keyAuthorization
              else await keyAuthorizationManager.remove(key)
            }
          }
        }
      }

      const keyAuthorizationSimulation = getKeyAuthorizationSimulation(
        request.keyAuthorization,
      )
      if (keyAuthorizationSimulation)
        request.keyAuthorizationSimulation = keyAuthorizationSimulation

      if (!request.feeToken && request.chain?.feeToken)
        request.feeToken = request.chain.feeToken

      return request as unknown as typeof r
    },
    {
      runAt: [
        'beforeFillTransaction',
        'afterFillTransactionError',
        'beforeFillParameters',
        'afterFillParameters',
      ],
    },
  ],
  serializers: {
    transaction: serializeTransaction,
    async transactionEnvelope({ serializedTransaction, transaction }) {
      const request = transaction as Transaction.TransactionSerializableTempo
      if (!request.accountSimulation) return serializedTransaction
      try {
        SignatureEnvelope.deserialize(serializedTransaction)
      } catch {
        const transaction = Transaction.deserialize(
          serializedTransaction as Transaction.TransactionSerializedTempo,
        )
        // A configurable access key (TIP-1111) signs inside a keychain envelope.
        if (
          transaction.signature?.type === 'configurable' ||
          transaction.signature?.type === 'keychain'
        )
          return serializedTransaction
        throw new Error(
          'A Tempo owner account is required to approve a configurable account transaction.',
        )
      }
      return await serializeTransaction({
        ...request,
        signatures: [...(request.signatures ?? []), serializedTransaction],
      } as never)
    },
  },
  transactionReplacement,
  async verifyHash(client, parameters) {
    const { address, hash, signature, mode } = parameters

    const serialized = (() => {
      if (typeof signature === 'string') return signature
      if (signature instanceof Uint8Array) return Hex.fromBytes(signature)
      return undefined
    })()
    const envelope = (() => {
      if (!serialized) return
      try {
        return SignatureEnvelope.deserialize(serialized)
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
        const { inner, userAddress, version } = envelope
        if (!isAddressEqual(userAddress, address)) return false
        const block = {
          blockHash: parameters.blockHash,
          blockNumber: parameters.blockNumber,
          blockTag: parameters.blockTag,
          requireCanonical: parameters.requireCanonical,
        }

        // The signature verifier rejects configurable access key signatures (TIP-1111),
        // so the grant and the delegate's current quorum are checked separately.
        if (inner.type === 'configurable') {
          if (version !== 'v2') return false
          const [keyInfo, valid] = await Promise.all([
            getMetadata(client, {
              ...block,
              account: address,
              accessKey: inner.account,
            } as never),
            (
              readContract(client, {
                ...block,
                ...verifyConfigurableAccount.call({
                  account: inner.account,
                  hash: keccak256(Hex.concat('0x04', hash, address)),
                  signature: SignatureEnvelope.serialize(inner),
                }),
              } as never) as Promise<boolean>
            ).catch(catchRevert),
          ])
          if (keyInfo.isRevoked) return false
          if (keyInfo.expiry <= BigInt(Math.floor(Date.now() / 1000)))
            return false
          if (!valid || keyInfo.keyType === 'configurable') return valid
          // A delegate with a config commitment uses its grant whatever key type the grant stores.
          const commitment = (await readContract(client, {
            ...block,
            ...getConfigCommitment.call({ account: inner.account }),
          } as never)) as Hex.Hex
          return BigInt(commitment) !== 0n
        }

        // From T14 the precompile also rejects a key ID with a config commitment
        // (a retired root key) and an inner signature type other than the stored key type.
        if (version === 'v2')
          return await (
            readContract(client, {
              ...block,
              ...verifyAccessKey.call({
                account: address,
                admin: false,
                hash,
                signature: serialized as Hex.Hex,
              }),
            } as never) as Promise<boolean>
          ).catch(catchRevert)

        // The precompile rejects legacy (V1) envelopes, whose inner signature signs `hash` directly.
        const accessKeyAddress = (() => {
          try {
            return SignatureEnvelope.extractAddress({
              payload: hash,
              signature: inner,
            })
          } catch {
            return undefined
          }
        })()
        if (!accessKeyAddress) return false

        const keyInfo = await getMetadata(client, {
          ...block,
          account: address,
          accessKey: accessKeyAddress,
        } as never)

        if (keyInfo.isRevoked) return false
        if (keyInfo.expiry <= BigInt(Math.floor(Date.now() / 1000)))
          return false
        return SignatureEnvelope.verify(inner, {
          address: accessKeyAddress,
          payload: hash,
        })
      }

      // Configurable account signatures are verified against the account's
      // current config commitment, which only the chain knows.
      // Reverts (malformed signatures or approvals below quorum) are invalid signatures.
      if (envelope.type === 'configurable')
        return await (
          readContract(client, {
            blockHash: parameters.blockHash,
            blockNumber: parameters.blockNumber,
            blockTag: parameters.blockTag,
            requireCanonical: parameters.requireCanonical,
            ...verifyConfigurableAccount.call({
              account: address,
              hash,
              signature: serialized as Hex.Hex,
            }),
          } as never) as Promise<boolean>
        ).catch(catchRevert)

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

/** Returns the access key's pending authorization manager entry when the request carries its authorization. */
async function getPending(request: {
  account?: Account | ConfigurableAccount | undefined
  chain?: Chain | undefined
  chainId?: number | undefined
  keyAuthorization?: KeyAuthorization.Signed | null | undefined
}) {
  const { account, keyAuthorization } = request
  if (!keyAuthorization || account?.source !== 'accessKey') return undefined
  const manager = account.keyAuthorizationManager
  const chainId = request.chainId ?? request.chain?.id
  if (!manager || typeof chainId === 'undefined') return undefined
  const key = {
    address: account.address,
    accessKey: account.accessKeyAddress,
    chainId,
  }
  const pending = await manager.get(key)
  if (
    !pending ||
    KeyAuthorization.serialize(pending) !==
      KeyAuthorization.serialize(keyAuthorization)
  )
    return undefined
  return { key, manager }
}

/** Whether the chain has registered an access key that is not revoked or expired. */
async function isRegistered(client: Client, key: KeyAuthorizationManager.Key) {
  const metadata = await getAction(
    client,
    getMetadata,
    'getMetadata',
  )({ account: key.address, accessKey: key.accessKey })
  return (
    isAddressEqual(metadata.address, key.accessKey) &&
    !metadata.isRevoked &&
    metadata.expiry > BigInt(Math.floor(Date.now() / 1000))
  )
}

/**
 * Returns whether a request uses an expiring nonce: when asked for, when sponsored,
 * or when another request for the same sender is in flight.
 */
async function useExpiringNonce(
  request: {
    account?: Account | ConfigurableAccount | Address | undefined
    feePayer?: unknown
    nonceKey?: bigint | number | 'expiring' | undefined
  },
  configurable: boolean,
) {
  const { account, feePayer, nonceKey } = request
  if (nonceKey === 'expiring' || nonceKey === maxUint256) return true
  if (typeof nonceKey !== 'undefined' || configurable) return false
  if (feePayer) return true
  const address = typeof account === 'string' ? account : account?.address
  if (!address) return false
  return await Concurrent.detect(address.toLowerCase())
}

/** Builds a bounded account spec for gas simulation. */
function getAccountSimulation(options: {
  config: AccountConfig.Config
  local?: ConfigurableAccount | undefined
}): AccountSimulation.Spec {
  const { config, local } = options
  return {
    approvals: selectOwners(config).map((owner) => {
      const localOwner = local?.owners.find((account) =>
        isAddressEqual(account.address, owner.owner),
      )
      return {
        ...getSimulationKey(localOwner),
        owner: owner.owner,
      }
    }),
    config,
  }
}

/**
 * Builds a simulation of the owner quorum signing a key authorization whose
 * configurable account approvals do not reach its threshold yet.
 */
function getKeyAuthorizationSimulation(
  keyAuthorization: KeyAuthorization.Signed | undefined,
): AccountSimulation.Spec | undefined {
  if (keyAuthorization?.signature.type !== 'configurable') return undefined
  const { account, signatures } = keyAuthorization.signature
  const config = AccountConfig.from(keyAuthorization.signature.config)
  const payload = AccountConfig.getSignPayload({
    account,
    config,
    payload: KeyAuthorization.getSignPayload(keyAuthorization),
  })
  const signed = new Set<string>()
  let weight = 0
  for (const signature of signatures) {
    const owner = (() => {
      try {
        return SignatureEnvelope.extractAddress({ payload, signature })
      } catch {
        return undefined
      }
    })()
    const entry = owner
      ? config.owners.find((entry) => isAddressEqual(entry.owner, owner))
      : undefined
    if (!entry || signed.has(entry.owner.toLowerCase())) continue
    signed.add(entry.owner.toLowerCase())
    weight += Number(entry.weight)
  }
  if (weight >= Number(config.threshold)) return undefined
  return { ...getAccountSimulation({ config }), signer: account }
}

/** Returns `false` for a reverted verification call, and rethrows other errors. */
function catchRevert(error: unknown): false {
  if (
    error instanceof BaseError &&
    error.walk((cause) => cause instanceof ContractFunctionRevertedError)
  )
    return false
  throw error
}

/** Returns signature metadata for conservative gas estimation. */
function getSimulationKey(
  account: unknown,
):
  | { keyData: Hex.Hex; keyType: 'webAuthn' }
  | { keyType: 'p256' | 'secp256k1' } {
  const keyType = (() => {
    if (
      account &&
      typeof account === 'object' &&
      'keyType' in account &&
      typeof account.keyType === 'string'
    )
      return account.keyType
    return undefined
  })()
  if (!keyType || keyType === 'webAuthn')
    return { keyData: '0x0578' as const, keyType: 'webAuthn' as const }
  if (keyType === 'p256' || keyType === 'secp256k1') return { keyType }
  return { keyData: '0x0578' as const, keyType: 'webAuthn' as const }
}

/** Selects a deterministic minimum-cardinality owner quorum. */
function selectOwners(config: AccountConfig.Config) {
  const owners = [...config.owners].sort(
    (a, b) =>
      Number(b.weight) - Number(a.weight) ||
      a.owner.toLowerCase().localeCompare(b.owner.toLowerCase()),
  )
  const selected: typeof owners = []
  let weight = 0
  for (const owner of owners.slice(0, AccountConfig.maxSignatures)) {
    if (weight >= Number(config.threshold)) break
    selected.push(owner)
    weight += Number(owner.weight)
  }
  return selected.sort((a, b) =>
    a.owner.toLowerCase().localeCompare(b.owner.toLowerCase()),
  )
}

/**
 * Intrinsic gas reserved for what `eth_fillTransaction` estimates without: the fee payer's signature and
 * fee token, and, from T14, one cold access (2,600 gas) of the fee payer's account. Earlier forks refund the unused gas.
 */
const feePayerGas = 5_000n
