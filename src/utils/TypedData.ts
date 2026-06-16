export * from 'ox/TypedData'

import * as Address from 'ox/Address'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as Signature from 'ox/Signature'
import * as TypedData from 'ox/TypedData'
import { secp256k1 } from '../core/Curve.js'
import type * as Curve from '../core/Curve.js'

/**
 * Recovers the signing address of signed [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
 * typed data.
 *
 * @example
 * ```ts
 * import { TypedData } from 'viem'
 *
 * const address = TypedData.recoverAddress({
 *   domain: { name: 'Ether Mail', version: '1', chainId: 1 },
 *   types: { Mail: [{ name: 'contents', type: 'string' }] },
 *   primaryType: 'Mail',
 *   message: { contents: 'Hello' },
 *   signature: '0x…',
 * })
 * ```
 */
export function recoverAddress<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(options: recoverAddress.Options<typedData, primaryType>): Address.Address {
  const { curve = secp256k1(), signature, ...value } = options
  const publicKey = curve.recoverPublicKey({
    payload: TypedData.getSignPayload(
      value as unknown as TypedData.encode.Value<typedData, primaryType>,
    ),
    signature,
  })
  return Address.fromPublicKey(publicKey)
}

export declare namespace recoverAddress {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData.encode.Value<typedData, primaryType> & {
    /** Signing curve (defaults to `Curve.secp256k1`). */
    curve?: Curve.Recoverable | undefined
    /** Signature of the typed data. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

  type ErrorType =
    | TypedData.getSignPayload.ErrorType
    | Address.fromPublicKey.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Verifies [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data was signed by the
 * provided address.
 *
 * Plain ECDSA verification — no ERC-1271/ERC-6492 smart-account support.
 *
 * @example
 * ```ts
 * import { TypedData } from 'viem'
 *
 * const valid = TypedData.verify({
 *   domain: { name: 'Ether Mail', version: '1', chainId: 1 },
 *   types: { Mail: [{ name: 'contents', type: 'string' }] },
 *   primaryType: 'Mail',
 *   message: { contents: 'Hello' },
 *   address, // or `publicKey`
 *   signature: '0x…',
 * })
 * ```
 */
export function verify<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
  curve extends Curve.Curve<any> = ReturnType<typeof secp256k1>,
>(
  options: verify.Options<typedData, primaryType, curve>,
): ReturnType<curve['verify']> {
  const { curve: curveOption, ...value } = options
  const curve = (curveOption ?? secp256k1()) as Curve.Curve<any>
  // `value` carries the typed data plus the curve's identity/signature/extra fields
  // (`address`/`publicKey`, `signature`, WebAuthn `metadata`). `getSignPayload` reads only the
  // EIP-712 fields and `verify` reads only the fields its curve needs, so both safely ignore the
  // other's keys.
  return curve.verify({
    ...value,
    payload: TypedData.getSignPayload(
      value as unknown as TypedData.encode.Value<typedData, primaryType>,
    ),
  }) as ReturnType<curve['verify']>
}

export declare namespace verify {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
    curve extends Curve.Curve<any> = ReturnType<typeof secp256k1>,
  > = TypedData.encode.Value<typedData, primaryType> & {
    /** Signing curve (defaults to `Curve.secp256k1`). */
    curve?: curve | undefined
  } & Curve.VerifyOptions<curve>

  type ErrorType = TypedData.getSignPayload.ErrorType | Errors.GlobalErrorType
}
