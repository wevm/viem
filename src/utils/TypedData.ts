export * from 'ox/TypedData'

import { Address, Secp256k1, TypedData as TypedData_ } from 'ox'
import type { Bytes, Errors, Hex, Signature } from 'ox'

import { BaseError } from '../core/Errors.js'

export class InvalidTypedDataTypeError extends BaseError {
  override name = 'InvalidTypedDataTypeError'

  constructor({ type }: { type: string }) {
    const canonicalType = type.replace(/^(u?int)/, '$&256')
    super(`Type "${type}" is not a valid EIP-712 type.`, {
      metaMessages: [`Use "${canonicalType}" instead.`],
    })
  }
}

/** Returns the EIP-712 signing payload. */
export function getSignPayload<
  const typedData extends TypedData_.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(value: TypedData_.encode.Value<typedData, primaryType>): Hex.Hex {
  for (const fields of Object.values(value.types ?? {}) as readonly (readonly {
    type: string
  }[])[])
    for (const { type } of fields) {
      const baseType = type.replace(/(\[[0-9]*\])+$/, '')
      if (baseType === 'int' || baseType === 'uint')
        throw new InvalidTypedDataTypeError({ type })
    }
  return TypedData_.getSignPayload(value)
}

export declare namespace getSignPayload {
  type ErrorType =
    | InvalidTypedDataTypeError
    | TypedData_.getSignPayload.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Recovers the signing address of signed [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
 * typed data.
 *
 * @example
 * ```ts
 * import { TypedData } from 'viem/utils'
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
  const typedData extends TypedData_.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(options: recoverAddress.Options<typedData, primaryType>): Address.Address {
  const { signature, ...value } = options
  const publicKey = Secp256k1.recoverPublicKey({
    payload: getSignPayload(
      value as unknown as TypedData_.encode.Value<typedData, primaryType>,
    ),
    signature,
  })
  return Address.fromPublicKey(publicKey)
}

export declare namespace recoverAddress {
  type Options<
    typedData extends TypedData_.TypedData | Record<string, unknown> =
      TypedData_.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData_.encode.Value<typedData, primaryType> & {
    /** Signature of the typed data. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  }

  type ErrorType =
    | getSignPayload.ErrorType
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
 * import { TypedData } from 'viem/utils'
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
  const typedData extends TypedData_.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(options: verify.Options<typedData, primaryType>): boolean {
  return Secp256k1.verify({
    ...options,
    payload: getSignPayload(
      options as unknown as TypedData_.encode.Value<typedData, primaryType>,
    ),
  } as Secp256k1.verify.Options)
}

export declare namespace verify {
  type Options<
    typedData extends TypedData_.TypedData | Record<string, unknown> =
      TypedData_.TypedData,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  > = TypedData_.encode.Value<typedData, primaryType> &
    Omit<Secp256k1.verify.Options, 'hash' | 'payload'>

  type ErrorType =
    | getSignPayload.ErrorType
    | Secp256k1.verify.ErrorType
    | Errors.GlobalErrorType
}
