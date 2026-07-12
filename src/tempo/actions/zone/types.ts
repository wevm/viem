import type { Address, Hex } from 'ox'

/** Encrypted deposit payload. */
export type EncryptedPayload = {
  /** Encrypted recipient and memo bytes. */
  ciphertext: Hex.Hex
  /** Ephemeral public key x-coordinate. */
  ephemeralPubkeyX: Hex.Hex
  /** Ephemeral public key y parity. */
  ephemeralPubkeyYParity: number
  /** AES-GCM nonce. */
  nonce: Hex.Hex
  /** AES-GCM authentication tag. */
  tag: Hex.Hex
}

/** Prepared encrypted deposit payload. */
export type PreparedEncryptedDeposit = {
  /** Amount of tokens to deposit. */
  amount: bigint
  /** Refund recipient on the parent chain if the deposit bounces. */
  bouncebackRecipient: Address.Address
  /** Parent chain ID. */
  chainId: number
  /** Encrypted deposit payload. */
  encrypted: EncryptedPayload
  /** Encryption key index from the portal contract. */
  keyIndex: bigint
  /** Zone portal address on the parent chain. */
  portalAddress: Address.Address
  /** Token address to deposit. */
  token: Address.Address
  /** Zone ID. */
  zoneId: number
}
