export * from 'ox/TypedData'

import type * as Address from 'ox/Address'
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
  return Secp256k1.recoverAddress({
    payload: TypedData.getSignPayload(
      value as unknown as TypedData.encode.Value<typedData, primaryType>,
    ),
    signature,
  })
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
    | Secp256k1.recoverAddress.ErrorType
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
 *   address: '0x…',
 *   domain: { name: 'Ether Mail', version: '1', chainId: 1 },
 *   types: { Mail: [{ name: 'contents', type: 'string' }] },
 *   primaryType: 'Mail',
 *   message: { contents: 'Hello' },
 *   signature: '0x…',
 * })
 * ```
 */
export function verify<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(options: verify.Options<typedData, primaryType>): boolean {
  const { address, signature, ...value } = options
  return Secp256k1.verify({
    address,
    payload: TypedData.getSignPayload(
      value as unknown as TypedData.encode.Value<typedData, primaryType>,
    ),
    signature,
  })
}

export declare namespace verify {
  type Options<
    typedData extends TypedData.TypedData | Record<string, unknown> =
      TypedData.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData.encode.Value<typedData, primaryType> & {
    /** Address that signed the typed data. */
    address: Address.Address
    /** Signature of the typed data. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

  type ErrorType =
    | TypedData.getSignPayload.ErrorType
    | Secp256k1.verify.ErrorType
    | Errors.GlobalErrorType
}
