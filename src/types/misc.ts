import type { OneOf } from './utils.js'

export type ByteArray = Uint8Array
export type Hex = `0x${string}`
export type Hash = `0x${string}`
export type LogTopic = Hex | Hex[] | null
export type SignableMessage =
  | string
  | {
      /** Raw data representation of the message. */
      raw: Hex | ByteArray
    }
export type SignatureLegacy = {
  r: Hex
  s: Hex
  v: bigint
}
export type Signature<
  uint32 = number,
  supportLegacy extends boolean = true,
> = supportLegacy extends true
  ? OneOf<
      | SignatureLegacy
      | {
          r: Hex
          s: Hex
          /** @deprecated use `yParity`. */
          v: bigint
          yParity?: uint32 | undefined
        }
      | {
          r: Hex
          s: Hex
          /** @deprecated use `yParity`. */
          v?: bigint | undefined
          yParity: uint32
        }
    >
  : {
      r: Hex
      s: Hex
      yParity: uint32
    }
export type CompactSignature = {
  r: Hex
  yParityAndS: Hex
}
