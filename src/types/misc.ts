import type { Address } from 'abitype'
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
  r: Hex
  s: Hex
  v: bigint
}
export type CompactSignature = {
  r: Hex
  yParityAndS: Hex
}

export type StateOverride = {
  [slots: Hex]: Hex
}

export type SingleAccountStateOverrideSet = {
  /** Fake balance to set for the account before executing the call. <32 bytes */
  balance?: Hex
  /** Fake nonce to set for the account before executing the call. <8 bytes */
  nonce?: Hex
  /** Fake EVM bytecode to inject into the account before executing the call. */
  code?: Hex
  /** Fake key-value mapping to override all slots in the account storage before executing the call. */
  state?: StateOverride
  /** Fake key-value mapping to override individual slots in the account storage before executing the call. */
  stateDiff?: StateOverride
}

export type StateOverrideSet = {
  [address: Address]: SingleAccountStateOverrideSet
}
