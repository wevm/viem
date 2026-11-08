import type { TransactionEnvelope as ox_TxEnvelope } from 'ox'
import {
  Address,
  Block as ox_Block,
  Hash,
  Hex,
  TransactionRequest as ox_TransactionRequest,
} from 'ox'
import {
  AccountConfig,
  AccountOperation,
  type AccountSimulation,
  KeyAuthorization,
  SignatureEnvelope,
  TransactionReceipt as TransactionReceiptTempo,
  TransactionRequest as TransactionRequestTempo,
  Transaction as TransactionTempo,
  TxEnvelopeTempo,
} from 'ox/tempo'

import type * as viem_Account from '../core/Account.js'
import * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import { getCode } from '../core/actions/address/getCode.js'
import { read } from '../core/actions/contract/read.js'
import { get as getTransaction } from '../core/actions/transaction/get.js'
import { verifyDefault, type verifyHash } from '../core/actions/verifyHash.js'
import * as ContractError from '../core/ContractError.js'
import { BaseError } from '../core/Errors.js'
import * as Contracts from '../core/internal/contracts.js'
import * as Abis from './Abis.js'
import type { ConfigurableAccount, RootAccount } from './Account.js'
import * as Addresses from './Addresses.js'
import type * as Capabilities from './Capabilities.js'
import type { Hardfork } from './Hardfork.js'
import type * as KeyAuthorizationManager from './KeyAuthorizationManager.js'
import { getConfig } from './actions/accounts/getConfig.js'
import { parseApproval } from './accounts/Signature.js'
import * as Expiry from './Expiry.js'
import * as Concurrent from './internal/concurrent.js'
import * as Replacement from './internal/replacement.js'

/**
 * Default distance, in seconds, of a generated expiring nonce `validBefore`.
 * Stays under {@link Expiry.expiringNonceMax} to allow for clock skew.
 */
const expiringNonceExpiry = Expiry.expiringNonceMax - 30
const maxUint256 = 2n ** 256n - 1n

/**
 * Intrinsic gas reserved for what `eth_fillTransaction` estimates without: the
 * fee payer's signature and fee token, and, from T14, one cold access (2,600
 * gas) of the fee payer's account. Earlier forks refund the unused gas.
 */
const feePayerGas = 5_000n

/** Tempo EOA default-delegation designator. */
const delegationCode = '0xef01007702c00000000000000000000000000000000000'

/** A Tempo transaction request. */
export type TransactionRequest = Omit<
  TransactionRequestTempo.TransactionRequest<
    Hex.Hex | bigint | number,
    Hex.Hex | number
  >,
  'capabilities' | 'feePayer' | 'nonceKey' | 'signatures'
> & {
  /** Capabilities to pass to `eth_fillTransaction`. */
  capabilities?: Capabilities.FillTransactionRequestCapabilities | undefined
  /**
   * Fee payer for TIP-1 gas sponsorship. Pass `true` for relay sponsorship,
   * an Account to co-sign locally, or an external sponsor URL allowed by the relay.
   */
  feePayer?: viem_Account.Account | boolean | string | undefined
  /** Stored account operation to approve. */
  hash?: Hex.Hex | undefined
  /** Owner signing an approval for a configurable account. */
  owner?: RootAccount | undefined
  /** Configurable account, config, and modeled approvals for gas estimation. */
  accountSimulation?: AccountSimulation.Spec | undefined
  /**
   * Nonce key for the 2D nonce system (TIP-1009). `'expiring'` selects an
   * expiring nonce (resolved while the request is prepared); `'random'`
   * selects a random key.
   */
  nonceKey?: 'expiring' | 'random' | bigint | undefined
  /** Owner approvals to combine into a configurable account signature (TIP-1107). */
  signatures?: readonly SignatureEnvelope.Serialized[] | undefined
}

/** RPC representation of a {@link TransactionRequest}. */
export type TransactionRequestRpc = TransactionRequestTempo.Rpc

/**
 * A Tempo transaction envelope. Client-side request metadata (`feePayer`,
 * `accountSimulation`, `signatures`) rides the envelope structurally: the chain's
 * `toEnvelope` hook threads it from the request, and the `serialize` hook
 * (or the signing account) consumes it.
 */
export type Envelope = TxEnvelopeTempo.TxEnvelopeTempo & {
  /** Fee payer of the transaction (TIP-1 gas sponsorship). */
  feePayer?: viem_Account.Account | boolean | string | undefined
  /** Owner signing an approval for a configurable account. */
  owner?: RootAccount | undefined
  /** Configurable account, config, and modeled approvals for gas estimation. */
  accountSimulation?: AccountSimulation.Spec | undefined
  /** Owner approvals to combine into a configurable account signature (TIP-1107). */
  signatures?: readonly SignatureEnvelope.Serialized[] | undefined
}

/**
 * The Tempo chain configuration shape. Codec and hook members are typed
 * nominally so declaration emit references them instead of expanding the
 * (large) inferred codec types.
 */
export type ChainConfig = {
  blockTime: number
  extendSchema: {
    feeToken?: Address.Address | undefined
    hardfork?: Hardfork | undefined
  }
  codecs: {
    block: {
      fromRpc: (rpc: BlockRpc) => Block
    }
    transaction: {
      fromRpc: (rpc: TransactionRpc) => Transaction
    }
    transactionReceipt: {
      fromRpc: (rpc: TransactionReceiptRpc) => TransactionReceipt
    }
    transactionRequest: {
      fromRpc: (rpc: Record<string, unknown>) => TransactionRequest
      toRpc: (request: TransactionRequest) => TransactionRequestRpc
    }
  }
  /** Tempo predeployed contracts. */
  contracts: {
    /** Canonical CREATE2 deployer. */
    create2: Chain.Chain.Contract
  }
  transaction: {
    getSignPayload: (envelope: Envelope | TxEnvelope) => Hex.Hex | undefined
    prepare: [
      fn: Chain.Chain.Transaction.PrepareFn,
      options: { runAt: readonly Chain.Chain.Transaction.PreparePhase[] },
    ]
    replacement: typeof Replacement.transactionReplacement
    serialize: (
      envelope: Envelope | TxEnvelope,
      options?: SerializeOptions | undefined,
    ) => Hex.Hex | undefined
    toEnvelope: (
      request: ox_TransactionRequest.TransactionRequest,
    ) => Envelope | undefined
  }
  verifyHash: Chain.Chain.VerifyHash
}

/**
 * Structural view of the signing account the prepare hook reads. All Tempo
 * and core account shapes satisfy it. @internal
 */
type PrepareAccount = {
  address: Address.Address
  accessKeyAddress?: Address.Address | undefined
  config?: AccountConfig.Config | undefined
  owners?: ConfigurableAccount['owners'] | undefined
  keyAuthorizationManager?:
    | KeyAuthorizationManager.KeyAuthorizationManager
    | undefined
  keyType?: 'configurable' | 'p256' | 'secp256k1' | 'webAuthn' | undefined
  delegate?: ConfigurableAccount | undefined
  source?: string | undefined
}

/** Request fields the prepare hook operates on. @internal */
type PrepareRequest = TransactionRequest & {
  account?: Address.Address | PrepareAccount | undefined
  chain?: (Chain.Chain & { feeToken?: Address.Address | undefined }) | undefined
  parameters?: readonly string[] | undefined
}

/**
 * Native-typed view of the request entering the `toEnvelope` hook (values are
 * decoded via the chain codecs by then). @internal
 */
type ToEnvelopeRequest = TransactionRequestTempo.TransactionRequest &
  Pick<
    TransactionRequest,
    'feePayer' | 'accountSimulation' | 'owner' | 'signatures'
  >

/**
 * Shared Tempo chain configuration: RPC converters, transaction hooks
 * (expiring nonces, configurable account senders, fee tokens), and signature-envelope
 * verification.
 */
export const chainConfig = {
  blockTime: 1_000,
  extendSchema: Chain.extendSchema<{
    feeToken?: Address.Address | undefined
    hardfork?: Hardfork | undefined
  }>(),
  codecs: {
    // The core block codec decodes transactions as Ethereum transactions, so
    // Tempo decodes the transactions inside blocks itself.
    block: {
      fromRpc(rpc: BlockRpc): Block {
        const { transactions, ...rest } = rpc
        return {
          // Pending blocks carry `null` hashes, which `fromRpc` passes through.
          ...ox_Block.fromRpc({ ...rest, transactions: [] } as ox_Block.Rpc),
          transactions: transactions.map((transaction) =>
            typeof transaction === 'string'
              ? transaction
              : decodeTransaction(transaction),
          ),
        } as Block
      },
    },
    transaction: {
      fromRpc: decodeTransaction,
    },
    transactionReceipt: {
      fromRpc(rpc: TransactionReceiptRpc): TransactionReceipt {
        const receipt = TransactionReceiptTempo.fromRpc(
          rpc as TransactionReceiptTempo.Rpc,
        )
        return {
          ...receipt,
          ...(rpc.status === 'pending'
            ? { status: 'pending' as const, type: 'tempo' as const }
            : {}),
          ...(rpc.operation
            ? {
                operation: AccountOperation.fromRpc(
                  rpc.operation,
                ) as AccountOperation.TransactionOperation,
              }
            : {}),
        }
      },
    },
    transactionRequest: {
      fromRpc: decodeRequest,
      toRpc: encodeRequest,
    },
  },
  contracts: {
    create2: {
      ...Contracts.create2,
      blockCreated: 0,
    },
  },
  transaction: {
    getSignPayload(envelope: Envelope | TxEnvelope): Hex.Hex | undefined {
      // Non-tempo envelopes delegate to the generic default.
      if (!isTempoEnvelope(envelope)) return undefined
      return TxEnvelopeTempo.getSignPayload(envelope)
    },
    prepare: [
      async (r, { client, error, phase }) => {
        const request = r as PrepareRequest
        const account_ = request.account
        const account = typeof account_ === 'string' ? undefined : account_

        // The node refuses an authorization of a registered key, so the fill
        // retries without it.
        if (phase === 'afterFillTransactionError') {
          const refused =
            error instanceof BaseError &&
            !!error.walk((cause) =>
              (cause as BaseError).details?.includes('KeyAlreadyExists'),
            )
          const pending = refused ? await getPending(request) : undefined
          if (!pending) return undefined
          await pending.manager.remove(pending.key)
          const { keyAuthorization: _, ...retry } = request
          return retry as Record<string, unknown>
        }

        // Without a successful fill, the node has not checked the attached
        // authorization.
        if (phase === 'beforeFillParameters') {
          if (
            typeof request.gas !== 'undefined' ||
            !request.parameters?.includes('gas')
          )
            return request as Record<string, unknown>
          const pending = await getPending(request)
          if (pending && (await isRegistered(client, pending.key))) {
            await pending.manager.remove(pending.key)
            delete request.keyAuthorization
          }
          return request as Record<string, unknown>
        }

        if (request.hash) {
          if (
            !request.account ||
            typeof request.account === 'string' ||
            request.account.source !== 'configurable'
          )
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
          const transaction = await getTransaction(client, {
            hash: request.hash,
          })
          const operation =
            'operation' in transaction
              ? (transaction.operation as
                  | AccountOperation.TransactionOperation
                  | undefined)
              : undefined
          if (!operation)
            throw new Error('Expected an account operation transaction.')
          if (!Address.isEqual(operation.account, request.account.address))
            throw new Error(
              'Account operation account does not match the requested account.',
            )
          const storedTransaction = TxEnvelopeTempo.deserialize(
            operation.transaction as TxEnvelopeTempo.Serialized,
          )
          const hash = AccountOperation.getHash({
            account: operation.account,
            config: operation.config,
            transaction: operation.transaction as TxEnvelopeTempo.Serialized,
            type: 'transaction',
          })
          if (hash.toLowerCase() !== request.hash.toLowerCase())
            throw new Error(
              'Account operation hash does not match transaction.',
            )
          Object.assign(request, {
            ...storedTransaction,
            gas: storedTransaction.gas ?? 0n,
            maxFeePerGas: storedTransaction.maxFeePerGas ?? 0n,
            maxPriorityFeePerGas: storedTransaction.maxPriorityFeePerGas ?? 0n,
            nonce: Number(storedTransaction.nonce ?? 0n),
            account: request.account,
            from: operation.account,
            accountSimulation: getAccountSimulation({
              config: operation.config,
              local: request.account as ConfigurableAccount,
            }),
            owner: request.owner,
          })
          return request as Record<string, unknown>
        }

        if (phase === 'afterFillParameters') {
          // The fee payer signature covers the gas limit, so the relay sets it
          // before signing and it must not change afterward. Owner approvals
          // also cover it, so a request carrying them keeps its gas.
          if (
            typeof request.gas !== 'undefined' &&
            request.feePayer &&
            !request.feePayerSignature &&
            !request.signatures?.length
          ) {
            // Fee-paid transactions are gas-estimated with a dummy secp256k1
            // signature and without the fee payer's signature and fee token;
            // larger envelope signatures cost more intrinsic gas.
            const gas =
              (typeof request.gas === 'bigint'
                ? request.gas
                : BigInt(request.gas)) + feePayerGas
            if (request.keyAuthorization?.signature.type === 'webAuthn')
              request.gas = gas + 20_000n
            else if (account?.source === 'accessKey')
              request.gas = gas + 10_000n
            else request.gas = gas
          }
          return request as Record<string, unknown>
        }

        // Tempo-ness can hinge on the signing account (access keys and
        // multisigs only exist on the tempo transaction type); resolve the
        // type up front so fill, gas estimation, and envelope inference all
        // agree.
        if (
          typeof request.type === 'undefined' &&
          (isTempoRequest(request) ||
            account?.source === 'accessKey' ||
            account?.source === 'configurable' ||
            (account?.keyType && account.keyType !== 'secp256k1'))
        )
          request.type = 'tempo'

        // The node's gas estimator prices the (larger) envelope signature
        // from `keyType`/`keyData`/`keyId` hints; derive them from the
        // signing account.
        const signer = request.owner ?? account
        if (signer && typeof signer !== 'string') {
          const type = signer.keyType ?? signer.source
          if (type === 'webAuthn') {
            request.keyType = 'webAuthn'
            // A 2-byte big-endian length hint (1400 = 0x0578) instead of a
            // 1400-byte dummy blob (see `shimKeyData`).
            request.keyData = '0x0578'
          } else if (type === 'p256' || type === 'secp256k1') {
            request.keyType = type
            request.keyData = undefined
          } else if (
            type === 'configurable' &&
            'delegate' in signer &&
            signer.delegate
          ) {
            // A configurable access key (TIP-1111) signs as its `keyId`
            // delegate.
            request.keyType = 'configurable'
            request.keyData = undefined
          }
          if ('accessKeyAddress' in signer && signer.accessKeyAddress)
            request.keyId = signer.accessKeyAddress
        }

        const configurableIdentity = (() => {
          if (account?.source === 'configurable')
            return {
              account: account.address,
              config: (account as ConfigurableAccount).config,
              local: account as ConfigurableAccount,
            }
          return undefined
        })()
        if (request.owner && !configurableIdentity)
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
          !!configurableIdentity &&
          !!request.owner &&
          (client.transport as { accounts?: boolean }).accounts === true
        if (configurableIdentity) {
          const { account, local } = configurableIdentity
          if (!account)
            throw new Error(
              'A configurable account address is required with a current config.',
            )
          const config = await (async () => {
            if (configurableIdentity.config) return configurableIdentity.config
            if (!coordinated) return undefined
            const cachedConfig = await getConfig(client, { address: account })
            if (!cachedConfig)
              throw new Error(
                `No current account config is cached for account ${account}. Provide the current config.`,
              )
            return cachedConfig
          })()
          if (!config)
            throw new Error(
              'An account config is required to prepare a transaction.',
            )
          request.from = account
          request.accountSimulation = getAccountSimulation({
            config,
            local,
          })
        }

        // A configurable account acting as an access key (TIP-1111). The node
        // models the delegate's owner quorum inside a keychain signature.
        const delegate =
          account?.source === 'accessKey' ? account.delegate : undefined
        if (delegate) {
          const config =
            delegate.config ??
            ((client.transport as { accounts?: boolean }).accounts === true
              ? await getConfig(client, { address: delegate.address })
              : undefined)
          if (!config)
            throw new Error(
              'An account config is required to prepare a transaction.',
            )
          request.accountSimulation = {
            ...getAccountSimulation({ config, local: delegate }),
            signer: delegate.address,
          }
        }

        // Use expiring nonces for concurrent transactions (TIP-1009).
        // Detect concurrency before preparing an access-key authorization so
        // asynchronous account work cannot serialize otherwise parallel sends.
        const useExpiringNonce = await (async () => {
          if (
            request.nonceKey === 'expiring' ||
            request.nonceKey === maxUint256
          )
            return true
          if (configurableIdentity) return false
          if (request.feePayer && typeof request.nonceKey === 'undefined')
            return true
          const address =
            typeof request.account === 'string'
              ? request.account
              : request.account?.address
          if (address && typeof request.nonceKey === 'undefined')
            return await Concurrent.detect(address.toLowerCase())
          return false
        })()

        if (coordinated && typeof request.nonceKey === 'undefined') {
          request.nonceKey = Hex.toBigInt(Hex.random(31)) + 1n
          request.nonce = 0
        } else if (useExpiringNonce) {
          request.nonceKey = maxUint256
          // A random discriminator keeps otherwise identical expiring
          // transactions distinct. 48 bits stay within
          // `Number.MAX_SAFE_INTEGER`.
          request.nonce ??= Hex.toNumber(Hex.random(6))
          if (typeof request.validBefore === 'undefined')
            request.validBefore = Expiry.seconds(expiringNonceExpiry)
        } else if (
          typeof request.nonceKey !== 'undefined' &&
          // Nonce key 0 is the protocol nonce, which core fills like an
          // Ethereum nonce.
          request.nonceKey !== 0n
        ) {
          // Explicit nonceKey provided (2D nonce mode).
          request.nonce = typeof request.nonce === 'number' ? request.nonce : 0
        }

        // Attach a pending key authorization (and drop it once the key is
        // registered on-chain).
        if (
          !request.keyAuthorization &&
          typeof request.account !== 'string' &&
          request.account?.source === 'accessKey'
        ) {
          const keyAuthorizationManager =
            request.account.keyAuthorizationManager
          const accessKey = request.account.accessKeyAddress
          if (keyAuthorizationManager && accessKey) {
            const chainId = request.chainId ?? request.chain?.id
            if (typeof chainId === 'number') {
              const address = request.account.address
              const key = { address, accessKey, chainId }
              const keyAuthorization = await keyAuthorizationManager.get(key)

              if (keyAuthorization) {
                const now = BigInt(Math.floor(Date.now() / 1000))
                if (
                  keyAuthorization.expiry != null &&
                  BigInt(keyAuthorization.expiry) <= now
                )
                  await keyAuthorizationManager.remove(key)
                else if (
                  // The fill checks the authorization, so it needs no
                  // separate read.
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

        return request as Record<string, unknown>
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
    replacement: Replacement.transactionReplacement,
    serialize(
      envelope: Envelope | TxEnvelope,
      options: SerializeOptions = {},
    ): Hex.Hex | undefined {
      // Non-tempo envelopes delegate to the generic default.
      if (!isTempoEnvelope(envelope)) return undefined

      // Track caller signatures separately from synthesized configurable account
      // approvals.
      const signature_provided = (() => {
        if (envelope.signature) return envelope.signature
        const signature = options.signature
        if (!signature) return undefined
        return SignatureEnvelope.from(signature)
      })()

      // Combine owner approvals before fee-payer handling.
      const signature = (() => {
        if (signature_provided) return signature_provided
        if (!envelope.accountSimulation || !envelope.signatures)
          return undefined

        const { from } = envelope
        if (!from)
          throw new Error(
            'A configurable account sender is required for signing.',
          )
        const { signer = from } = envelope.accountSimulation
        // A configurable access key (TIP-1111) approves the keychain digest
        // bound to the sender.
        const delegated = !Address.isEqual(signer, from)
        const config = AccountConfig.from(envelope.accountSimulation.config)
        const payload = TxEnvelopeTempo.getSignPayload(
          TxEnvelopeTempo.from(envelope),
          delegated ? { from } : {},
        )
        const signatures = envelope.signatures.map((approval) =>
          parseApproval(approval),
        )
        const sorted = SignatureEnvelope.sortApprovals({
          payload,
          signatures,
          account: signer,
          config,
        })
        const inner = SignatureEnvelope.from({
          account: signer,
          config,
          signatures: sorted,
        })
        if (!delegated) return inner
        return SignatureEnvelope.from({
          inner,
          type: 'keychain',
          userAddress: from,
          version: 'v2',
        })
      })()

      const hasPrefilledFeePayerSignature =
        typeof envelope.feePayerSignature !== 'undefined' &&
        envelope.feePayerSignature !== null

      // Sponsored transactions (TIP-1 gas sponsorship): the sender does not commit to
      // `feeToken` — its exclusion from the sign payload is driven by the
      // envelope's `feePayerSignature` marker (see `toEnvelope`).
      if (envelope.feePayer || (!signature && hasPrefilledFeePayerSignature)) {
        // Fee payer signature was prefilled (e.g. during
        // `eth_fillTransaction`) — emit a full envelope with both signatures.
        if (signature && hasPrefilledFeePayerSignature)
          return TxEnvelopeTempo.serialize(envelope, { signature })
        // Sender-signed sponsorship handoff: serialize in the fee payer
        // format (`0x78`) so a relay can countersign. (A local fee-payer
        // Account co-signs in `Account.signTransaction` instead.)
        if (signature)
          return TxEnvelopeTempo.serialize(envelope, {
            format: 'feePayer',
            sender: envelope.from,
            signature,
          })
        // Unsigned sponsorship envelope (`feePayerSignature: null` encodes
        // the pre-sign marker).
        return TxEnvelopeTempo.serialize(envelope, { feePayerSignature: null })
      }

      return TxEnvelopeTempo.serialize(envelope, { signature })
    },
    toEnvelope(
      request: ox_TransactionRequest.TransactionRequest,
    ): Envelope | undefined {
      // Non-tempo requests delegate to the generic default.
      if (!isTempoRequest(request)) return undefined

      const { feePayer, accountSimulation, owner, signatures, ...rest } =
        request as ToEnvelopeRequest

      const envelope = TransactionRequestTempo.toEnvelope({
        ...rest,
        ...(typeof feePayer !== 'undefined'
          ? { feePayer: typeof feePayer === 'object' ? true : feePayer }
          : {}),
      })

      return {
        ...envelope,
        ...(typeof feePayer !== 'undefined' ? { feePayer } : {}),
        ...(accountSimulation ? { accountSimulation } : {}),
        ...(owner ? { owner } : {}),
        ...(signatures ? { signatures } : {}),
      } as Envelope
    },
  },
  async verifyHash(client, parameters) {
    const {
      address,
      blockHash,
      blockNumber,
      blockTag,
      hash,
      mode,
      requireCanonical,
      signature,
    } = parameters

    // `verifyHash` supports "signature envelopes" (a Tempo proposal) to
    // natively verify envelope-compatible (WebAuthn, P256, …) signatures.
    const envelope = (() => {
      try {
        return SignatureEnvelope.deserialize(signature)
      } catch {
        return undefined
      }
    })()

    if (envelope) {
      // Access-key (keychain) verification: the key must be authorized,
      // unexpired, and not revoked on the AccountKeychain.
      if (envelope.type === 'keychain' && mode === 'allowAccessKey') {
        const { inner, userAddress, version } = envelope
        if (!Address.isEqual(userAddress, address)) return false
        const block = blockHash
          ? { blockHash, requireCanonical }
          : typeof blockNumber === 'bigint'
            ? { blockNumber }
            : { blockTag }
        const getKey = (accessKey: Address.Address) =>
          read(client, {
            ...block,
            abi: Abis.accountKeychain,
            address: Addresses.accountKeychain,
            args: [address, accessKey],
            functionName: 'getKey',
          }) as Promise<{
            expiry: bigint
            isRevoked: boolean
            signatureType: number
          }>
        const isActive = (key: { expiry: bigint; isRevoked: boolean }) =>
          !key.isRevoked && key.expiry > BigInt(Math.floor(Date.now() / 1000))

        // The signature verifier rejects configurable access key signatures
        // (TIP-1111), so the grant and the delegate's current quorum are
        // checked separately.
        if (inner.type === 'configurable') {
          if (version !== 'v2') return false
          const [key, valid] = await Promise.all([
            getKey(inner.account),
            read(client, {
              ...block,
              abi: Abis.signatureVerifier,
              address: Addresses.signatureVerifier,
              args: [
                inner.account,
                Hash.keccak256(Hex.concat('0x04', hash, address)),
                SignatureEnvelope.serialize(inner),
              ],
              functionName: 'verifyConfigurableAccount',
            }).catch(catchRevert),
          ])
          if (!isActive(key)) return false
          // Key type 3 is a configurable account.
          if (!valid || key.signatureType === 3) return valid
          // A delegate with a config commitment uses its grant whatever key
          // type the grant stores.
          const commitment = await read(client, {
            ...block,
            abi: Abis.configurableAccount,
            address: Addresses.configurableAccount,
            args: [inner.account],
            functionName: 'getConfigCommitment',
          })
          return BigInt(commitment) !== 0n
        }

        // From T14 the precompile also rejects a key ID with a config
        // commitment (a retired root key) and an inner signature type other
        // than the stored key type.
        if (version === 'v2')
          return await read(client, {
            ...block,
            abi: Abis.signatureVerifier,
            address: Addresses.signatureVerifier,
            args: [address, hash, signature],
            functionName: 'verifyKeychain',
          }).catch(catchRevert)

        // The precompile rejects legacy (V1) envelopes, whose inner signature
        // signs `hash` directly.
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
        if (!isActive(await getKey(accessKeyAddress))) return false
        return SignatureEnvelope.verify(inner, {
          address: accessKeyAddress,
          payload: hash,
        })
      }

      // Configurable account signatures verify against the account's current
      // config commitment, which only the chain knows. Reverts (malformed
      // signatures or approvals below quorum) are invalid signatures.
      if (envelope.type === 'configurable')
        return await read(client, {
          abi: Abis.signatureVerifier,
          address: Addresses.signatureVerifier,
          args: [address, hash, signature],
          functionName: 'verifyConfigurableAccount',
          ...(blockHash
            ? { blockHash, requireCanonical }
            : typeof blockNumber === 'bigint'
              ? { blockNumber }
              : { blockTag }),
        }).catch(catchRevert)

      // Stateless envelopes (P256, WebAuthn) verify without a network request
      // for EOAs (including the Tempo default delegation); contracts fall
      // through to the ERC-1271 flow.
      if (envelope.type === 'p256' || envelope.type === 'webAuthn') {
        const code = await getCode(client, {
          address,
          ...(blockHash
            ? { blockHash, requireCanonical }
            : typeof blockNumber === 'bigint'
              ? { blockNumber }
              : { blockTag }),
        })
        if (!code || code === delegationCode)
          return SignatureEnvelope.verify(envelope, {
            address,
            payload: hash,
          })
      }
    }

    return await verifyDefault(client, parameters as verifyHash.Options)
  },
} satisfies Pick<
  Chain.Chain,
  | 'blockTime'
  | 'codecs'
  | 'contracts'
  | 'extendSchema'
  | 'transaction'
  | 'verifyHash'
> as ChainConfig

/** Returns `false` for a reverted verification call, and rethrows other errors. */
function catchRevert(error: unknown): false {
  if (
    error instanceof BaseError &&
    error.walk(
      (cause) => cause instanceof ContractError.ContractFunctionRevertedError,
    )
  )
    return false
  throw error
}

/** Untyped envelopes are assumed tempo (they flow from `toEnvelope`). @internal */
function isTempoEnvelope(
  envelope: Envelope | TxEnvelope,
): envelope is Envelope {
  return !envelope.type || envelope.type === 'tempo'
}

/**
 * Whether a request targets the tempo transaction type: an explicit
 * `type: 'tempo'`, or any tempo-specific field.
 */
function isTempoRequest(request: Record<string, unknown>): boolean {
  return (
    request.type === 'tempo' ||
    typeof request.calls !== 'undefined' ||
    typeof request.capabilities !== 'undefined' ||
    typeof request.feePayer !== 'undefined' ||
    typeof request.feePayerSignature !== 'undefined' ||
    typeof request.feeToken !== 'undefined' ||
    typeof request.keyAuthorization !== 'undefined' ||
    typeof request.keyData !== 'undefined' ||
    typeof request.keyId !== 'undefined' ||
    typeof request.keyType !== 'undefined' ||
    typeof request.accountSimulation !== 'undefined' ||
    typeof request.keyAuthorizationSimulation !== 'undefined' ||
    typeof request.owner !== 'undefined' ||
    typeof request.nonceKey !== 'undefined' ||
    typeof request.signature !== 'undefined' ||
    typeof request.signatures !== 'undefined' ||
    typeof request.validAfter !== 'undefined' ||
    typeof request.validBefore !== 'undefined'
  )
}

/** Decodes (wire → native) a Tempo RPC transaction. @internal */
function decodeTransaction(rpc: TransactionRpc): Transaction {
  const transaction = TransactionTempo.fromRpc(rpc)
  return {
    ...transaction,
    ...(rpc.operation
      ? {
          operation: AccountOperation.fromRpc(
            rpc.operation,
          ) as AccountOperation.TransactionOperation,
        }
      : {}),
  }
}

/** Decodes (wire → native) a Tempo RPC transaction request. @internal */
function decodeRequest(rpc: Record<string, unknown>): TransactionRequest {
  return TransactionRequestTempo.fromRpc(rpc) as TransactionRequest
}

/** Encodes (native → wire) a Tempo transaction request. @internal */
function encodeRequest(
  r: Record<string, unknown>,
): TransactionRequestRpc | ox_TransactionRequest.Rpc {
  // Non-tempo requests take the generic encoding.
  if (!isTempoRequest(r)) return ox_TransactionRequest.toRpc(r)

  // `accountSimulation`/`signatures` are client-side only. They drive
  // sender derivation, owner signing, and final envelope assembly, but are
  // never sent as raw RPC fields — the wire payload is the serialized tx.
  // An `'expiring'` nonce key is resolved by the prepare hook and never
  // reaches the wire.
  const {
    feePayer,
    owner: _owner,
    nonceKey,
    signatures: _signatures,
    ...rest
  } = r as TransactionRequest

  const rpc = TransactionRequestTempo.toRpc({
    ...rest,
    type: 'tempo',
    ...(typeof feePayer === 'boolean' ? { feePayer } : {}),
    ...(typeof nonceKey === 'bigint' || nonceKey === 'random'
      ? { nonceKey }
      : { nonceKey: undefined }),
  }) as TransactionRequestRpc

  // A local fee-payer Account (a viem concept) encodes as `feePayer: true`
  // but keeps `feeToken` on the wire: the client chose the token, and the
  // fee payer commits to it when co-signing. (ox withholds `feeToken` only
  // for external sponsorship, where the fee payer picks the token.)
  if (typeof feePayer === 'object') rpc.feePayer = true
  if (typeof feePayer === 'string') Object.assign(rpc, { feePayer })

  return rpc
}

/**
 * Returns the access key's pending authorization manager entry when the
 * request carries its authorization.
 */
async function getPending(request: PrepareRequest) {
  const { account, keyAuthorization } = request
  if (!keyAuthorization || typeof account !== 'object') return undefined
  if (account.source !== 'accessKey') return undefined
  const manager = account.keyAuthorizationManager
  const accessKey = account.accessKeyAddress
  const chainId = request.chainId ?? request.chain?.id
  if (!manager || !accessKey || typeof chainId !== 'number') return undefined
  const key = { address: account.address, accessKey, chainId }
  const pending = await manager.get(key)
  // Stores may normalize the casing of the serialized authorization.
  if (
    !pending ||
    KeyAuthorization.serialize(pending).toLowerCase() !==
      KeyAuthorization.serialize(keyAuthorization).toLowerCase()
  )
    return undefined
  return { key, manager }
}

/** Whether the chain has registered an access key that is not revoked or expired. */
async function isRegistered(
  client: Client.Client,
  key: KeyAuthorizationManager.Key,
) {
  const metadata = (await read(client, {
    abi: Abis.accountKeychain,
    address: Addresses.accountKeychain,
    args: [key.address, key.accessKey],
    functionName: 'getKey',
  })) as { keyId: Address.Address; expiry: bigint; isRevoked: boolean }
  return (
    Address.isEqual(metadata.keyId, key.accessKey) &&
    !metadata.isRevoked &&
    metadata.expiry > BigInt(Math.floor(Date.now() / 1000))
  )
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
        Address.isEqual(account.address, owner.owner),
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
      ? config.owners.find((entry) => Address.isEqual(entry.owner, owner))
      : undefined
    if (!entry || signed.has(entry.owner.toLowerCase())) continue
    signed.add(entry.owner.toLowerCase())
    weight += Number(entry.weight)
  }
  if (weight >= Number(config.threshold)) return undefined
  return { ...getAccountSimulation({ config }), signer: account }
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

// Exported so consumer declaration emit can name them. See `internal/inference.ts`.
export type Block = ox_Block.Block<
  boolean,
  ox_Block.Tag,
  bigint,
  number,
  Transaction
>
export type BlockRpc = ox_Block.Rpc<boolean, ox_Block.Tag, TransactionRpc>
export type Transaction = TransactionTempo.Transaction & {
  operation?: AccountOperation.TransactionOperation | undefined
}
export type TransactionRpc = TransactionTempo.Rpc & {
  operation?: AccountOperation.TransactionRpc | undefined
}
export type TransactionReceipt = Omit<
  TransactionReceiptTempo.TransactionReceipt,
  'status'
> & {
  status: 'success' | 'reverted' | 'pending'
  operation?: AccountOperation.TransactionOperation | undefined
}
export type TransactionReceiptRpc = Omit<
  TransactionReceiptTempo.Rpc,
  'status'
> & {
  status: '0x0' | '0x1' | 'pending'
  operation?: AccountOperation.TransactionRpc | undefined
}
export type TxEnvelope = ox_TxEnvelope.TxEnvelope
export type SerializeOptions = TxEnvelopeTempo.serialize.Options

// Re-exports, not aliases, and un-renamed on purpose: these leak structurally, and the
// emitter prints a re-export's original name, so only the original names resolve.
export type { RpcType, Type } from 'ox/tempo/TransactionReceipt'
