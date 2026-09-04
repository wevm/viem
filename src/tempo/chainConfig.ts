import type { TransactionEnvelope as ox_TxEnvelope } from 'ox'
import {
  Address,
  Hash,
  Hex,
  TransactionRequest as ox_TransactionRequest,
} from 'ox'
import {
  MultisigConfig,
  MultisigOperation,
  type MultisigSimulation,
  SignatureEnvelope,
  TransactionReceipt as TransactionReceiptTempo,
  TransactionRequest as TransactionRequestTempo,
  Transaction as TransactionTempo,
  TxEnvelopeTempo,
} from 'ox/tempo'

import type * as viem_Account from '../core/Account.js'
import * as Chain from '../core/Chain.js'
import { getCode } from '../core/actions/address/getCode.js'
import { read } from '../core/actions/contract/read.js'
import { get as getTransaction } from '../core/actions/transaction/get.js'
import { verifyDefault, type verifyHash } from '../core/actions/verifyHash.js'
import * as Contracts from '../core/internal/contracts.js'
import * as Abis from './Abis.js'
import type { MultisigAccount, RootAccount } from './Account.js'
import * as Addresses from './Addresses.js'
import type * as Capabilities from './Capabilities.js'
import type { Hardfork } from './Hardfork.js'
import type * as KeyAuthorizationManager from './KeyAuthorizationManager.js'
import { getConfig } from './actions/multisig/getConfig.js'
import * as Concurrent from './internal/concurrent.js'

const maxExpirySecs = 25
const maxUint256 = 2n ** 256n - 1n

/** Returns a random past timestamp for unique expiring transactions. */
function randomValidAfter(): number {
  const now = BigInt(Math.floor(Date.now() / 1_000))
  const latest = now - 60n
  if (latest <= 0n) return 0
  return Number(BigInt(Hex.random(8)) % latest)
}

/** Tempo EOA default-delegation designator. */
const delegationCode = '0xef01007702c00000000000000000000000000000000000'

/** A Tempo transaction request. */
export type TransactionRequest = Omit<
  TransactionRequestTempo.TransactionRequest<
    Hex.Hex | bigint | number,
    Hex.Hex | number
  >,
  'capabilities' | 'feePayer' | 'nonceKey'
> & {
  /** Capabilities to pass to `eth_fillTransaction`. */
  capabilities?: Capabilities.FillTransactionRequestCapabilities | undefined
  /**
   * Fee payer of the transaction (TIP-1 gas sponsorship). Pass `true` to defer the fee
   * token to an external fee payer (e.g. a relay), or a local Account to
   * co-sign the transaction as the fee payer.
   */
  feePayer?: viem_Account.Account | boolean | undefined
  /** Stored multisig operation to approve. */
  hash?: Hex.Hex | undefined
  /** Owner signing a multisig approval. */
  owner?: MultisigAccount | RootAccount | undefined
  /** Multisig account, config, and modeled approvals for gas estimation. */
  multisigSimulation?: MultisigSimulation.Spec | undefined
  /**
   * Nonce key for the 2D nonce system (TIP-1009). `'expiring'` selects an
   * expiring nonce (resolved while the request is prepared); `'random'`
   * selects a random key.
   */
  nonceKey?: 'expiring' | 'random' | bigint | undefined
  /** Owner approvals to combine into a multisig signature (TIP-1061). */
  signatures?: readonly SignatureEnvelope.Serialized[] | undefined
}

/** RPC representation of a {@link TransactionRequest}. */
export type TransactionRequestRpc = TransactionRequestTempo.Rpc

/**
 * A Tempo transaction envelope. Client-side request metadata (`feePayer`,
 * `multisig`, `signatures`) rides the envelope structurally: the chain's
 * `toEnvelope` hook threads it from the request, and the `serialize` hook
 * (or the signing account) consumes it.
 */
export type Envelope = TxEnvelopeTempo.TxEnvelopeTempo & {
  /** Fee payer of the transaction (TIP-1 gas sponsorship). */
  feePayer?: viem_Account.Account | boolean | undefined
  /** Owner signing a multisig approval. */
  owner?: MultisigAccount | RootAccount | undefined
  /** Multisig account, config, and modeled approvals for gas estimation. */
  multisigSimulation?: MultisigSimulation.Spec | undefined
  /** Owner approvals to combine into a multisig signature (TIP-1061). */
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
  config?: MultisigConfig.Config | undefined
  owners?: MultisigAccount['owners'] | undefined
  keyAuthorizationManager?:
    | KeyAuthorizationManager.KeyAuthorizationManager
    | undefined
  keyType?: 'multisig' | 'p256' | 'secp256k1' | 'webAuthn' | undefined
  source?: string | undefined
}

/** Request fields the prepare hook operates on. @internal */
type PrepareRequest = TransactionRequest & {
  account?: Address.Address | PrepareAccount | undefined
  chain?: (Chain.Chain & { feeToken?: Address.Address | undefined }) | undefined
}

/**
 * Native-typed view of the request entering the `toEnvelope` hook (values are
 * decoded via the chain codecs by then). @internal
 */
type ToEnvelopeRequest = TransactionRequestTempo.TransactionRequest &
  Pick<
    TransactionRequest,
    'feePayer' | 'multisigSimulation' | 'owner' | 'signatures'
  >

/**
 * Shared Tempo chain configuration: RPC converters, transaction hooks
 * (expiring nonces, multisig senders, fee tokens), and signature-envelope
 * verification.
 */
export const chainConfig = {
  blockTime: 1_000,
  extendSchema: Chain.extendSchema<{
    feeToken?: Address.Address | undefined
    hardfork?: Hardfork | undefined
  }>(),
  codecs: {
    transaction: {
      fromRpc(rpc: TransactionRpc): Transaction {
        const transaction = TransactionTempo.fromRpc(rpc)
        return {
          ...transaction,
          ...(rpc.multisig
            ? {
                multisig: MultisigOperation.fromRpc(
                  rpc.multisig,
                ) as MultisigOperation.TransactionOperation,
              }
            : {}),
        }
      },
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
          ...(rpc.multisig
            ? {
                multisig: MultisigOperation.fromRpc(
                  rpc.multisig,
                ) as MultisigOperation.TransactionOperation,
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
      async (r, { client, phase }) => {
        const request = r as PrepareRequest
        const account_ = request.account
        const account = typeof account_ === 'string' ? undefined : account_

        if (request.hash) {
          if (
            !request.account ||
            typeof request.account === 'string' ||
            request.account.source !== 'multisig'
          )
            throw new Error(
              'A local multisig account is required to approve a stored multisig transaction.',
            )
          if (!request.owner || typeof request.owner === 'string')
            throw new Error(
              'A local owner account is required to approve a stored multisig transaction.',
            )
          if (
            request.owner.source !== 'root' &&
            request.owner.source !== 'multisig'
          )
            throw new Error(
              'A Tempo owner account is required to approve a stored multisig transaction.',
            )
          const transaction = await getTransaction(client, {
            hash: request.hash,
          })
          const operation =
            'multisig' in transaction
              ? (transaction.multisig as
                  | MultisigOperation.TransactionOperation
                  | undefined)
              : undefined
          if (!operation)
            throw new Error('Expected a multisig operation transaction.')
          if (!Address.isEqual(operation.account, request.account.address))
            throw new Error(
              'Multisig operation account does not match the requested account.',
            )
          const storedTransaction = TxEnvelopeTempo.deserialize(
            operation.transaction as TxEnvelopeTempo.Serialized,
          )
          const hash = MultisigOperation.getHash({
            account: operation.account,
            config: operation.config,
            transaction: operation.transaction as TxEnvelopeTempo.Serialized,
            type: 'transaction',
          })
          if (hash.toLowerCase() !== request.hash.toLowerCase())
            throw new Error(
              'Multisig operation hash does not match transaction.',
            )
          Object.assign(request, {
            ...storedTransaction,
            nonce: Number(storedTransaction.nonce ?? 0n),
            account: request.account,
            from: operation.account,
            multisigSimulation: getMultisigSimulation({
              account: operation.account,
              config: operation.config,
              local: request.account as MultisigAccount,
            }),
            owner: request.owner,
          })
          return request as Record<string, unknown>
        }

        if (phase === 'afterFillParameters') {
          if (
            typeof request.gas !== 'undefined' &&
            request.feePayer &&
            !request.feePayerSignature
          ) {
            // Fee-paid transactions are gas-estimated with a dummy secp256k1
            // signature and a null fee-payer signature; larger envelope
            // signatures cost more intrinsic gas.
            const gas =
              typeof request.gas === 'bigint'
                ? request.gas
                : BigInt(request.gas)
            if (request.keyAuthorization?.signature.type === 'webAuthn')
              request.gas = gas + 20_000n
            else if (account?.source === 'accessKey')
              request.gas = gas + 10_000n
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
            account?.source === 'multisig' ||
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
          }
          if ('accessKeyAddress' in signer && signer.accessKeyAddress)
            request.keyId = signer.accessKeyAddress
        }

        const multisigIdentity = (() => {
          if (account?.source === 'multisig')
            return {
              account: account.address,
              config: (account as MultisigAccount).config,
              local: account as MultisigAccount,
            }
          return undefined
        })()
        if (request.owner && !multisigIdentity)
          throw new Error(
            'A multisig account is required when an owner is provided.',
          )
        if (request.owner && typeof request.owner === 'string')
          throw new Error(
            'A local owner account is required to approve a multisig transaction.',
          )
        if (
          request.owner &&
          request.owner.source !== 'root' &&
          request.owner.source !== 'multisig'
        )
          throw new Error(
            'A Tempo owner account is required to approve a multisig transaction.',
          )
        const coordinatedMultisig =
          !!multisigIdentity &&
          !!request.owner &&
          (client.transport as { multisig?: boolean }).multisig === true
        if (multisigIdentity) {
          const { account, local } = multisigIdentity
          if (!account)
            throw new Error(
              'A multisig account address is required with a current config.',
            )
          const config = await (async () => {
            if (multisigIdentity.config) return multisigIdentity.config
            if (!coordinatedMultisig) return undefined
            const cachedConfig = await getConfig(client, { address: account })
            if (!cachedConfig)
              throw new Error(
                `No current multisig config is cached for account ${account}. Provide the current config.`,
              )
            return cachedConfig
          })()
          if (!config)
            throw new Error(
              'A multisig config is required to prepare a transaction.',
            )
          request.from = account
          request.multisigSimulation = getMultisigSimulation({
            account,
            config,
            local,
          })
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
          if (multisigIdentity) return false
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

        if (coordinatedMultisig && typeof request.nonceKey === 'undefined') {
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
                ) {
                  await keyAuthorizationManager.remove(key)
                } else {
                  const metadata = (await read(client, {
                    abi: Abis.accountKeychain,
                    address: Addresses.accountKeychain,
                    args: [address, accessKey],
                    functionName: 'getKey',
                  })) as {
                    keyId: Address.Address
                    expiry: bigint
                    isRevoked: boolean
                  }

                  if (
                    metadata.keyId.toLowerCase() === accessKey.toLowerCase() &&
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

        return request as Record<string, unknown>
      },
      { runAt: ['beforeFillTransaction', 'afterFillParameters'] },
    ],
    serialize(
      envelope: Envelope | TxEnvelope,
      options: SerializeOptions = {},
    ): Hex.Hex | undefined {
      // Non-tempo envelopes delegate to the generic default.
      if (!isTempoEnvelope(envelope)) return undefined

      // Track caller signatures separately from synthesized multisig
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
        if (!envelope.multisigSimulation || !envelope.signatures)
          return undefined

        const payload = TxEnvelopeTempo.getSignPayload(
          TxEnvelopeTempo.from(envelope),
        )
        const signatures = envelope.signatures.map((approval) =>
          SignatureEnvelope.from(approval),
        )
        const sorted = SignatureEnvelope.sortMultisigApprovals({
          payload,
          signatures,
          account: envelope.multisigSimulation.account,
          config: MultisigConfig.from(envelope.multisigSimulation.config),
        })
        return SignatureEnvelope.from({
          account: envelope.multisigSimulation.account,
          config: MultisigConfig.from(envelope.multisigSimulation.config),
          signatures: sorted,
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

      const { feePayer, multisigSimulation, owner, signatures, ...rest } =
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
        ...(multisigSimulation ? { multisigSimulation } : {}),
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
        // v2 keychain envelopes sign keccak256(0x04 || hash || userAddress).
        const innerPayload =
          envelope.version === 'v2'
            ? Hash.keccak256(Hex.concat('0x04', hash, address))
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

        const key = (await read(client, {
          abi: Abis.accountKeychain,
          address: Addresses.accountKeychain,
          args: [address, accessKeyAddress],
          blockHash,
          blockNumber,
          blockTag,
          functionName: 'getKey',
          requireCanonical,
        })) as { expiry: bigint; isRevoked: boolean }

        if (key.isRevoked) return false
        if (key.expiry <= BigInt(Math.floor(Date.now() / 1000))) return false
        return SignatureEnvelope.verify(envelope.inner, {
          address: accessKeyAddress,
          payload: innerPayload,
        })
      }

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
    typeof request.multisigSimulation !== 'undefined' ||
    typeof request.owner !== 'undefined' ||
    typeof request.nonceKey !== 'undefined' ||
    typeof request.signature !== 'undefined' ||
    typeof request.signatures !== 'undefined' ||
    typeof request.validAfter !== 'undefined' ||
    typeof request.validBefore !== 'undefined'
  )
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

  // `multisig`/`signatures` are client-side only. They drive
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

  return rpc
}

/** Builds a bounded multisig spec for gas simulation. */
function getMultisigSimulation(options: {
  account: Address.Address
  config: MultisigConfig.Config
  local?: MultisigAccount | undefined
}): MultisigSimulation.Spec {
  const { account, config, local } = options
  return {
    account,
    approvals: selectOwners(config).map((owner) => {
      const localOwner = local?.owners.find((account) =>
        Address.isEqual(account.address, owner.owner),
      )
      if (localOwner?.source === 'multisig') {
        const nested = localOwner as MultisigAccount
        if (!nested.config)
          throw new Error(
            'A nested multisig config is required for gas estimation.',
          )
        return {
          type: 'multisig',
          spec: {
            account: nested.address,
            approvals: selectOwners(nested.config).map((owner) => {
              const nestedOwner = nested.owners.find((account) =>
                Address.isEqual(account.address, owner.owner),
              )
              if (nestedOwner?.source === 'multisig')
                throw new Error(
                  'Multisig simulation nesting exceeds depth two.',
                )
              return {
                ...getSimulationKey(nestedOwner),
                owner: owner.owner,
              }
            }),
            config: nested.config,
          },
        }
      }
      return {
        ...getSimulationKey(localOwner),
        owner: owner.owner,
        type: 'primitive',
      }
    }),
    config,
  }
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
function selectOwners(config: MultisigConfig.Config) {
  const owners = [...config.owners].sort(
    (a, b) =>
      Number(b.weight) - Number(a.weight) ||
      a.owner.toLowerCase().localeCompare(b.owner.toLowerCase()),
  )
  const selected: typeof owners = []
  let weight = 0
  for (const owner of owners.slice(0, MultisigConfig.maxSignatures)) {
    if (weight >= Number(config.threshold)) break
    selected.push(owner)
    weight += Number(owner.weight)
  }
  return selected.sort((a, b) =>
    a.owner.toLowerCase().localeCompare(b.owner.toLowerCase()),
  )
}

// Exported so consumer declaration emit can name them. See `internal/inference.ts`.
export type Transaction = TransactionTempo.Transaction & {
  multisig?: MultisigOperation.TransactionOperation | undefined
}
export type TransactionRpc = TransactionTempo.Rpc & {
  multisig?: MultisigOperation.TransactionRpc | undefined
}
export type TransactionReceipt = Omit<
  TransactionReceiptTempo.TransactionReceipt,
  'status'
> & {
  status: 'success' | 'reverted' | 'pending'
  multisig?: MultisigOperation.TransactionOperation | undefined
}
export type TransactionReceiptRpc = Omit<
  TransactionReceiptTempo.Rpc,
  'status'
> & {
  status: '0x0' | '0x1' | 'pending'
  multisig?: MultisigOperation.TransactionRpc | undefined
}
export type TxEnvelope = ox_TxEnvelope.TxEnvelope
export type SerializeOptions = TxEnvelopeTempo.serialize.Options

// Re-exports, not aliases, and un-renamed on purpose: these leak structurally, and the
// emitter prints a re-export's original name, so only the original names resolve.
export type { RpcType, Type } from 'ox/tempo/TransactionReceipt'
