import { Errors, Hex } from 'ox'
import type { Bytes, Signature } from 'ox'

/**
 * [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact signature, with
 * the recovery bit packed into the highest bit of `yParityAndS`.
 */
export type SignatureErc2098 = {
  r: Hex.Hex
  yParityAndS: Hex.Hex
}

/**
 * Converts a signature into an [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098)
 * compact signature.
 *
 * @example
 * ```ts
 * import { SignatureErc2098 } from 'viem'
 *
 * const compact = SignatureErc2098.from({
 *   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 *   s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 *   yParity: 0,
 * })
 * ```
 */
export function from(signature: Signature.Signature): SignatureErc2098 {
  const { r, s, yParity } = signature
  const yParityAndS = Hex.fromNumber(
    yParity === 1 ? Hex.toBigInt(s) | (1n << 255n) : Hex.toBigInt(s),
    { size: 32 },
  )
  return { r: Hex.padLeft(r, 32), yParityAndS }
}

export declare namespace from {
  type ErrorType =
    | Hex.fromNumber.ErrorType
    | Hex.padLeft.ErrorType
    | Hex.toBigInt.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Deserializes a 64-byte hex or bytes value into an
 * [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact signature.
 *
 * @example
 * ```ts
 * import { SignatureErc2098 } from 'viem'
 *
 * const compact = SignatureErc2098.fromHex('0x…')
 * ```
 */
export function fromHex(value: Hex.Hex | Bytes.Bytes): SignatureErc2098 {
  const hex = Hex.from(value)
  if (Hex.size(hex) !== 64) throw new InvalidSerializedSizeError({ value })
  return {
    r: Hex.slice(hex, 0, 32),
    yParityAndS: Hex.slice(hex, 32, 64),
  }
}

export declare namespace fromHex {
  type ErrorType =
    | Hex.from.ErrorType
    | Hex.size.ErrorType
    | Hex.slice.ErrorType
    | InvalidSerializedSizeError
    | Errors.GlobalErrorType
}

/**
 * Serializes an [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact
 * signature into a 64-byte hex value.
 *
 * @example
 * ```ts
 * import { SignatureErc2098 } from 'viem'
 *
 * const serialized = SignatureErc2098.toHex(compact)
 * ```
 */
export function toHex(signature: SignatureErc2098): Hex.Hex {
  const { r, yParityAndS } = signature
  return Hex.concat(Hex.padLeft(r, 32), Hex.padLeft(yParityAndS, 32))
}

export declare namespace toHex {
  type ErrorType =
    | Hex.concat.ErrorType
    | Hex.padLeft.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Converts an [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact
 * signature into a recovered signature.
 *
 * @example
 * ```ts
 * import { SignatureErc2098 } from 'viem'
 *
 * const signature = SignatureErc2098.toSignature({
 *   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
 *   yParityAndS: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 * })
 * ```
 */
export function toSignature(signature: SignatureErc2098): Signature.Signature {
  const { r, yParityAndS } = signature
  const packed = Hex.toBigInt(yParityAndS)
  return {
    r,
    s: Hex.fromNumber(packed & ((1n << 255n) - 1n), { size: 32 }),
    yParity: packed >> 255n ? 1 : 0,
  }
}

export declare namespace toSignature {
  type ErrorType =
    | Hex.fromNumber.ErrorType
    | Hex.toBigInt.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when a serialized compact signature is not 64 bytes. */
export class InvalidSerializedSizeError extends Errors.BaseError {
  override name = 'SignatureErc2098.InvalidSerializedSizeError'

  constructor({ value }: { value: Hex.Hex | Bytes.Bytes }) {
    super(
      `Value \`${Hex.from(value)}\` is an invalid size (expected 64 bytes).`,
    )
  }
}
