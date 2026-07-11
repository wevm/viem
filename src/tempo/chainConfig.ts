import { Hash, Hex, TransactionRequest as ox_TransactionRequest } from 'ox'
import type { Address, TransactionEnvelope as TxEnvelope } from 'ox'
import {
  MultisigConfig,
  SignatureEnvelope,
  Transaction as TransactionTempo,
  TransactionReceipt as TransactionReceiptTempo,
  TransactionRequest as TransactionRequestTempo,
  TxEnvelopeTempo,
} from 'ox/tempo'

import type * as viem_Account from '../core/Account.js'
import * as Chain from '../core/Chain.js'
import { getCode } from '../core/actions/address/getCode.js'
import { read } from '../core/actions/contract/read.js'
import { verifyDefault, type verifyHash } from '../core/actions/verifyHash.js'
import * as Abis from './Abis.js'
import * as Addresses from './Addresses.js'
import type * as Capabilities from './Capabilities.js'
import type { Hardfork } from './Hardfork.js'
import type * as KeyAuthorizationManager from './KeyAuthorizationManager.js'
import * as Concurrent from './internal/concurrent.js'

const maxExpirySecs = 25
const maxUint256 = 2n ** 256n - 1n

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
  /** Native multisig config (TIP-1061); derives the transaction sender. */
  multisig?: MultisigConfig.Config | undefined
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
  /** Native multisig config (TIP-1061). */
  multisig?: MultisigConfig.Config | undefined
  /** Owner approvals to combine into a multisig signature (TIP-1061). */
  signatures?: readonly SignatureEnvelope.Serialized[] | undefined
}

/**
 * The Tempo chain configuration shape. Codec and hook members are typed
 * nominally so declaration emit references them instead of expanding the
 * (large) inferred schema types.
 */
export type ChainConfig = {
  blockTime: number
  extendSchema: {
    feeToken?: Address.Address | undefined
    hardfork?: Hardfork | undefined
  }
  schema: {
    transaction: {
      fromRpc: (rpc: TransactionTempo.Rpc) => TransactionTempo.Transaction
    }
    transactionReceipt: {
      fromRpc: (
        rpc: TransactionReceiptTempo.Rpc,
      ) => TransactionReceiptTempo.TransactionReceipt
    }
    transactionRequest: {
      fromRpc: (rpc: Record<string, unknown>) => TransactionRequest
      toRpc: (request: TransactionRequest) => TransactionRequestRpc
    }
  }
  transaction: {
    getSignPayload: (
      envelope: Envelope | TxEnvelope.TxEnvelope,
    ) => Hex.Hex | undefined
    prepare: [
      fn: Chain.Chain.Transaction.PrepareFn,
      options: { runAt: readonly Chain.Chain.Transaction.PreparePhase[] },
    ]
    serialize: (
      envelope: Envelope | TxEnvelope.TxEnvelope,
      options?: TxEnvelopeTempo.serialize.Options | undefined,
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
  keyAuthorizationManager?:
    | KeyAuthorizationManager.KeyAuthorizationManager
    | undefined
  keyType?: 'multisig' | 'p256' | 'secp256k1' | 'webAuthn' | undefined
  source?: string | undefined
}

/** Request fields the prepare hook operates on. @internal */
type PrepareRequest = TransactionRequest & {
  account?: PrepareAccount | undefined
  chain?: (Chain.Chain & { feeToken?: Address.Address | undefined }) | undefined
}

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
  schema: {
    transaction: { fromRpc: TransactionTempo.fromRpc },
    transactionReceipt: { fromRpc: TransactionReceiptTempo.fromRpc },
    transactionRequest: {
      fromRpc: decodeRequest,
      toRpc: encodeRequest,
    },
  },
  transaction: {
    getSignPayload(
      envelope: Envelope | TxEnvelope.TxEnvelope,
    ): Hex.Hex | undefined {
      // Non-tempo envelopes delegate to the generic default.
      if (!isTempoEnvelope(envelope)) return undefined
      return TxEnvelopeTempo.getSignPayload(envelope)
    },
    prepare: [
      async (r, { client, phase }) => {
        const request = r as PrepareRequest

        if (phase === 'afterFillParameters') {
          if (request.feePayer) {
            // Fee-paid transactions are gas-estimated with a dummy secp256k1
            // signature and a null fee-payer signature; larger envelope
            // signatures cost more intrinsic gas.
            if (request.keyAuthorization?.signature.type === 'webAuthn')
              request.gas =
                ((request.gas as bigint | undefined) ?? 0n) + 20_000n
            else if (request.account?.source === 'accessKey')
              request.gas =
                ((request.gas as bigint | undefined) ?? 0n) + 10_000n
          }
          return request as Record<string, unknown>
        }

        const account = request.account

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
        if (account) {
          const type = account.keyType ?? account.source
          if (type === 'webAuthn') {
            request.keyType = 'webAuthn'
            // A 2-byte big-endian length hint (1400 = 0x0578) instead of a
            // 1400-byte dummy blob (see `shimKeyData`).
            request.keyData = '0x0578'
          } else if (type === 'p256' || type === 'secp256k1') {
            request.keyType = type
            request.keyData = undefined
          }
          if (account.accessKeyAddress) request.keyId = account.accessKeyAddress
        }

        // Native multisig (TIP-1061). The transaction sender is the derived
        // multisig account, not a signing account (owner accounts only
        // contribute approvals later via `signTransaction`). Derive the
        // sender from the config; core fills nonce/gas/fees for it via
        // `request.from`, and the serializer auto-detects bootstrap (`init`)
        // from `nonce == 0`.
        //
        // The config is taken from an explicit `multisig` field, or inferred
        // from a multisig account (so callers can just pass `account`
        // without also passing `multisig`).
        const multisig =
          request.multisig ??
          (account?.source === 'multisig' ? account.config : undefined)
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
          // A non-multisig `account` (e.g. the client's default) isn't the
          // sender, so drop it: core then fills nonce/gas/fees for the
          // multisig sender via `request.from`. A multisig account *is* the
          // sender — keep it so the prepared request can be sent without
          // re-passing `account`.
          if (account?.source !== 'multisig') delete request.account
        }

        // Attach a pending key authorization (and drop it once the key is
        // registered on-chain).
        if (
          !request.keyAuthorization &&
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

        // Use expiring nonces for concurrent transactions (TIP-1009).
        // When nonceKey is 'expiring', feePayer is specified, or concurrent
        // requests are detected, use an expiring nonce (nonceKey =
        // uint256.max) with a validBefore timestamp.
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
          // Explicit nonceKey provided (2D nonce mode).
          request.nonce = typeof request.nonce === 'number' ? request.nonce : 0
        }

        if (!request.feeToken && request.chain?.feeToken)
          request.feeToken = request.chain.feeToken

        return request as Record<string, unknown>
      },
      { runAt: ['beforeFillTransaction', 'afterFillParameters'] },
    ],
    serialize(
      envelope: Envelope | TxEnvelope.TxEnvelope,
      options: TxEnvelopeTempo.serialize.Options = {},
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

      // Combine owner approvals into the multisig signature envelope
      // (TIP-1061) before fee-payer handling. Bootstrap (`init`) is detected
      // from `nonce == 0`.
      const signature = (() => {
        if (signature_provided) return signature_provided
        if (!envelope.multisig || !envelope.signatures) return undefined

        const payload = TxEnvelopeTempo.getSignPayload(
          TxEnvelopeTempo.from(envelope),
        )
        const signatures = envelope.signatures.map((approval) =>
          SignatureEnvelope.from(approval),
        )
        const sorted = SignatureEnvelope.sortMultisigApprovals({
          payload,
          signatures,
          genesisConfig: envelope.multisig,
        })
        return SignatureEnvelope.from({
          genesisConfig: envelope.multisig,
          signatures: sorted,
          ...(envelope.nonce ? {} : { init: true }),
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

      const { feePayer, multisig, signatures, ...rest } =
        request as TransactionRequest

      const envelope = TransactionRequestTempo.toEnvelope({
        ...rest,
        ...(typeof feePayer !== 'undefined'
          ? { feePayer: typeof feePayer === 'object' ? true : feePayer }
          : {}),
      } as never)

      return {
        ...envelope,
        ...(typeof feePayer !== 'undefined' ? { feePayer } : {}),
        ...(multisig ? { multisig } : {}),
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
          blockHash,
          blockNumber,
          blockTag,
          requireCanonical,
        } as never)
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
  'blockTime' | 'extendSchema' | 'schema' | 'transaction' | 'verifyHash'
> as ChainConfig

/** Untyped envelopes are assumed tempo (they flow from `toEnvelope`). @internal */
function isTempoEnvelope(
  envelope: Envelope | TxEnvelope.TxEnvelope,
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
    typeof request.multisig !== 'undefined' ||
    typeof request.multisigInit !== 'undefined' ||
    typeof request.multisigSignatureCount !== 'undefined' ||
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
    multisig: _multisig,
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

/**
 * Infers the minimum number of owner approvals that reach the multisig
 * threshold (heaviest owners first). @internal
 */
function inferMultisigSignatureCount(config: MultisigConfig.Config): number {
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
