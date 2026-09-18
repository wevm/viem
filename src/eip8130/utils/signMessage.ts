import type { Address, TypedData } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex, SignableMessage } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../../utils/abi/encodeAbiParameters.js'
import { type ConcatHexErrorType, concatHex } from '../../utils/data/concat.js'
import { pad } from '../../utils/data/pad.js'
import { size } from '../../utils/data/size.js'
import { slice } from '../../utils/data/slice.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { numberToHex, stringToHex } from '../../utils/encoding/toHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import {
  type HashMessageErrorType,
  hashMessage,
} from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import {
  type SerializeErc6492SignatureErrorType,
  serializeErc6492Signature,
} from '../../utils/signature/serializeErc6492Signature.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type { AaActor } from '../types/transaction.js'
import { type ToFactoryArgsErrorType, toFactoryArgs } from './keystoreCalls.js'
import type { Signer } from './signTransaction.js'

/**
 * `keccak256("SignedMessageEnvelope(address account,uint256 chainId,bytes32 hash)")`
 *
 * Mirrors `Keystore.SIGNED_MESSAGE_TYPEHASH`. Deliberately **not** EIP-712 (no
 * domain separator) so a wallet's `eth_signTypedData` cannot be phished into
 * producing one; the account + chainId scoping lives inside the struct.
 */
export const signedMessageTypehash = keccak256(
  stringToHex(
    'SignedMessageEnvelope(address account,uint256 chainId,bytes32 hash)',
  ),
)

/**
 * Signature-envelope channel byte (`Keystore.SignatureType`), the leading byte
 * of an EIP-8130 signature (`sigType || authenticator || data`).
 *
 * - `local` (`0x01`) — binds `block.chainid`; the signature is valid on one chain.
 * - `multichain` (`0x02`) — binds `chainId = 0`; the signature is valid on every
 *   chain (mirrors the `applySignedAccountChanges` multichain channel).
 *
 * `0x00` is the reserved `Invalid` value and is rejected on-chain.
 */
export const signatureType = {
  local: 0x01,
  multichain: 0x02,
} as const

export type SignatureType = keyof typeof signatureType

/**
 * The chain a `multichain` envelope binds to (`0`, i.e. every chain).
 */
export const multichainId = 0n

export type ReplaySafeHashParameters = {
  /** The account the signature is bound to. */
  account: Address
  /**
   * The chain the signature is bound to. `block.chainid` for a `local`
   * signature, `0` for a `multichain` (all-chains) signature.
   */
  chainId: number | bigint
  /** The raw app digest (e.g. `hashMessage(message)` / `hashTypedData(...)`). */
  hash: Hex
}

export type ReplaySafeHashErrorType = EncodeAbiParametersErrorType | ErrorType

/**
 * Computes the EIP-8130 replay-safe message digest — the value an actor actually
 * signs for `hash` to be accepted for `account` on `chainId`
 * (`Keystore.replaySafeHash`):
 *
 * ```
 * keccak256(abi.encode(SIGNED_MESSAGE_TYPEHASH, account, chainId, hash))
 * ```
 */
export function replaySafeHash(parameters: ReplaySafeHashParameters): Hex {
  const { account, chainId, hash } = parameters
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
      ],
      [signedMessageTypehash, account, BigInt(chainId), hash],
    ),
  )
}

export type GetSignatureEnvelopeHashParameters = {
  /** The account the signature is bound to. */
  account: Address
  /** The raw app digest to wrap. */
  hash: Hex
  /** Envelope channel. @default 'multichain' */
  sigType?: SignatureType | undefined
  /**
   * Chain to bind a `local` envelope to (`block.chainid`). Required for
   * `sigType: 'local'`; ignored for `multichain` (always `0`).
   */
  chainId?: number | bigint | undefined
}

/**
 * Resolves the `sigType` to its bound chain id and returns the
 * {@link replaySafeHash} digest to sign (`Keystore.envelopeDigest`). This is the
 * digest an actor's authenticator signs; prepend `sigType || authenticator` to
 * the resulting signature to form the on-chain envelope (see
 * {@link wrapSignatureEnvelope}).
 */
export function getSignatureEnvelopeHash(
  parameters: GetSignatureEnvelopeHashParameters,
): Hex {
  const { account, hash, sigType = 'multichain', chainId } = parameters
  if (sigType === 'local' && chainId === undefined)
    throw new Error('`chainId` is required for a `local` signature envelope.')
  return replaySafeHash({
    account,
    chainId: sigType === 'multichain' ? multichainId : chainId!,
    hash,
  })
}

export type WrapSignatureEnvelopeParameters = {
  /** Envelope channel. */
  sigType: SignatureType
  /** Authenticator address that validates `signature`. */
  authenticator: Address
  /**
   * Authenticator-specific `data`: a raw 65-byte ECDSA signature for the native
   * secp256k1 authenticator, or the authenticator's blob otherwise.
   */
  signature: Hex
}

/**
 * Wraps an authenticator signature into the on-chain EIP-8130 signature envelope
 * consumed by `Keystore.validateSignature` / an account's ERC-1271
 * `isValidSignature`:
 *
 * ```
 * sigType(1) || authenticator(20) || data
 * ```
 */
export function wrapSignatureEnvelope(
  parameters: WrapSignatureEnvelopeParameters,
): Hex {
  const { sigType, authenticator, signature } = parameters
  return concatHex([
    numberToHex(signatureType[sigType], { size: 1 }),
    pad(authenticator, { size: 20 }),
    signature,
  ])
}

export type ParsedSignatureEnvelope = {
  /** Envelope channel resolved from the leading byte. */
  sigType: SignatureType
  /** Authenticator address (bytes 1..21). */
  authenticator: Address
  /** Authenticator-specific `data` (the remaining bytes). */
  signature: Hex
}

/**
 * Decodes an EIP-8130 signature envelope (`sigType || authenticator || data`)
 * back into its parts. Inverse of {@link wrapSignatureEnvelope}.
 */
export function parseSignatureEnvelope(envelope: Hex): ParsedSignatureEnvelope {
  if (size(envelope) < 21)
    throw new Error(
      'Signature envelope must be at least 21 bytes (`sigType || authenticator`).',
    )
  const typeByte = hexToNumber(slice(envelope, 0, 1))
  const sigType = (Object.keys(signatureType) as SignatureType[]).find(
    (k) => signatureType[k] === typeByte,
  )
  if (!sigType)
    throw new Error(`Unknown signature envelope type byte: ${typeByte}.`)
  return {
    sigType,
    authenticator: slice(envelope, 1, 21),
    signature: slice(envelope, 21),
  }
}

export type SignMessageEnvelopeParameters = {
  /**
   * Signer producing the authenticator `data` over the envelope digest. For the
   * native secp256k1 path this is a `LocalAccount` (its `sign` returns a raw
   * 65-byte ECDSA signature); for a P-256 / WebAuthn / delegate actor it returns
   * the authenticator-specific blob.
   */
  signer: Signer
  /** The account the signature is bound to. */
  account: Address
  /**
   * Authenticator address written into the envelope. Defaults to the signer's
   * `authenticator`, then the native `ECRECOVER_AUTHENTICATOR`.
   */
  authenticator?: Address | undefined
  /** Envelope channel. @default 'multichain' */
  sigType?: SignatureType | undefined
  /** Chain to bind a `local` envelope to. Required for `sigType: 'local'`. */
  chainId?: number | bigint | undefined
} & (
  | { message: SignableMessage; hash?: undefined; typedData?: undefined }
  | { hash: Hex; message?: undefined; typedData?: undefined }
)

export type SignMessageEnvelopeErrorType =
  | HashMessageErrorType
  | ReplaySafeHashErrorType
  | ConcatHexErrorType
  | ErrorType

/**
 * Produces an EIP-8130 ERC-1271 signature for `message` (or a pre-computed
 * `hash`), ready to pass to `Keystore.validateSignature` or an account's
 * `isValidSignature`.
 *
 * It hashes the message (`hashMessage`), wraps it in the chain/account-scoped
 * {@link getSignatureEnvelopeHash replay-safe digest}, signs that with `signer`,
 * and returns the `sigType || authenticator || data` envelope.
 *
 * @example
 * ```ts
 * import { signMessageEnvelope } from 'viem/eip8130'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const owner = privateKeyToAccount('0x…')
 * const signature = await signMessageEnvelope({
 *   signer: owner,
 *   account: account.address,
 *   message: 'hello world',
 *   // sigType: 'local', chainId: 8453,   // chain-bound; default is multichain
 * })
 * // verify via core ERC-1271: client.verifyMessage({ address, message, signature })
 * ```
 */
export async function signMessageEnvelope(
  parameters: SignMessageEnvelopeParameters,
): Promise<Hex> {
  const {
    signer,
    account,
    sigType = 'multichain',
    chainId,
    message,
    hash: hash_,
  } = parameters
  if (!signer.sign)
    throw new Error('`signer` does not support raw signing (`sign`).')
  const authenticator =
    parameters.authenticator ?? signer.authenticator ?? ecrecoverAuthenticator
  const hash = hash_ ?? hashMessage(message!)
  const digest = getSignatureEnvelopeHash({ account, hash, sigType, chainId })
  const signature = await signer.sign({ hash: digest })
  return wrapSignatureEnvelope({ sigType, authenticator, signature })
}

export type SignTypedDataEnvelopeParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
> = TypedDataDefinition<typedData, primaryType> & {
  /** Signer producing the authenticator `data`. */
  signer: Signer
  /** The account the signature is bound to. */
  account: Address
  /** Authenticator address. Defaults to the signer's, then native ecrecover. */
  authenticator?: Address | undefined
  /** Envelope channel. @default 'multichain' */
  sigType?: SignatureType | undefined
  /** Chain to bind a `local` envelope to. Required for `sigType: 'local'`. */
  chainId?: number | bigint | undefined
}

/**
 * EIP-712 variant of {@link signMessageEnvelope}: hashes `typedData` with
 * `hashTypedData`, then produces the same account/chain-scoped envelope. The
 * inner EIP-712 domain is the app's; the outer `SignedMessageEnvelope` scoping
 * (which is not itself EIP-712) binds the signature to the 8130 account.
 */
export async function signTypedDataEnvelope<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  parameters: SignTypedDataEnvelopeParameters<typedData, primaryType>,
): Promise<Hex> {
  const {
    signer,
    account,
    sigType = 'multichain',
    chainId,
    ...typedData
  } = parameters as SignTypedDataEnvelopeParameters
  const authenticator =
    parameters.authenticator ?? signer.authenticator ?? ecrecoverAuthenticator
  const hash = hashTypedData(typedData as never)
  return signMessageEnvelope({
    signer,
    account,
    authenticator,
    sigType,
    chainId,
    hash,
  })
}

export type WrapCounterfactualSignatureParameters = {
  /**
   * The EIP-8130 signature envelope to wrap (e.g. from {@link signMessageEnvelope}
   * or `account.signMessage(...)`).
   */
  signature: Hex
  /** User-chosen uniqueness factor (bytes32) — as passed to `newSmartAccount`. */
  userSalt: Hex
  /** Runtime bytecode placed at the account address. */
  code: Hex
  /** Initial actors (sorted by `actorId`, strictly ascending). */
  initialActors: readonly AaActor[]
}

export type WrapCounterfactualSignatureErrorType =
  | ToFactoryArgsErrorType
  | SerializeErc6492SignatureErrorType
  | ErrorType

/**
 * Wraps an EIP-8130 signature envelope in an [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492)
 * signature so it verifies for a **counterfactual** (not-yet-deployed) account.
 *
 * A plain envelope is validated via the account's `isValidSignature`, which
 * requires code at the address. Before the account is deployed, wrap the
 * envelope with the keystore `createAccount` deploy call: `client.verifyMessage`
 * / `verifyHash` then deploy-and-verify through the ERC-6492 universal validator,
 * exactly as viem does for other counterfactual smart accounts.
 *
 * @example
 * ```ts
 * import { newSmartAccount, signMessageEnvelope, wrapCounterfactualSignature } from 'viem/eip8130'
 *
 * const account = newSmartAccount({ signer, userSalt, code, initialActors })
 * const envelope = await signMessageEnvelope({ signer, account: account.address, message: 'gm' })
 * const signature = wrapCounterfactualSignature({ signature: envelope, userSalt, code, initialActors })
 *
 * // Verifies even though `account.address` has no code yet.
 * const valid = await client.verifyMessage({ address: account.address, message: 'gm', signature })
 * ```
 */
export function wrapCounterfactualSignature(
  parameters: WrapCounterfactualSignatureParameters,
): Hex {
  const { signature, userSalt, code, initialActors } = parameters
  const { factory, factoryData } = toFactoryArgs({
    userSalt,
    code,
    initialActors,
  })
  return serializeErc6492Signature({
    address: factory,
    data: factoryData,
    signature,
  })
}
