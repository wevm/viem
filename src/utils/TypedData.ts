export * from 'ox/TypedData'

import * as Address from 'ox/Address'
import type * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Secp256k1 from 'ox/Secp256k1'
import type * as Signature from 'ox/Signature'
import * as TypedData from 'ox/TypedData'

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
  const { signature, ...value } = options
  const publicKey = Secp256k1.recoverPublicKey({
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
    /** Signature of the typed data. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

  type ErrorType =
    | TypedData.getSignPayload.ErrorType
    | Secp256k1.recoverPublicKey.ErrorType
    | Address.fromPublicKey.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Verifies [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data was signed by the
 * provided address (or public key).
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
>(options: verify.Options<typedData, primaryType>): boolean {
  return Secp256k1.verify({
    ...options,
    payload: TypedData.getSignPayload(
      options as unknown as TypedData.encode.Value<typedData, primaryType>,
    ),
  } as Secp256k1.verify.Options)
}

export declare namespace verify {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData.encode.Value<typedData, primaryType> &
    Omit<Secp256k1.verify.Options, 'hash' | 'payload'>

  type ErrorType =
    | TypedData.getSignPayload.ErrorType
    | Secp256k1.verify.ErrorType
    | Errors.GlobalErrorType
}
