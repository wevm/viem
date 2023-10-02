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
export type Signature = {
  // TODO(v2): Make `bigint`
  r: Hex
  // TODO(v2): Make `bigint`
  s: Hex
  // TODO(v2): `v` to `recovery`
  v: bigint
}
export type CompactSignature = {
  // TODO(v2): Make `bigint`
  r: Hex
  // TODO(v2): Make `bigint`
  yParityAndS: Hex
}
