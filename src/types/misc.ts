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
export type Signature = OneOf<
  | SignatureLegacy
  | {
      r: Hex
      s: Hex
      /** @deprecated use `yParity`. */
      v: bigint
      yParity?: number
    }
  | {
      r: Hex
      s: Hex
      /** @deprecated use `yParity`. */
      v?: bigint
      yParity: number
    }
>
export type CompactSignature = {
  r: Hex
  yParityAndS: Hex
}
