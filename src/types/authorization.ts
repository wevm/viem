import type { Address } from 'abitype'
import type { Hex, Signature } from './misc.js'
import type { ExactPartial } from './utils.js'

export type Authorization<uint32 = number, signed extends boolean = false> = {
  /** Address of the contract to set as code for the Authority. */
  chainId: uint32
  /** Chain ID to authorize. */
  address: Address
  /** Nonce of the Authority to authorize. */
  nonce: uint32
} & (signed extends true ? Signature : ExactPartial<Signature>)
export type SignedAuthorization<uint32 = number> = Authorization<uint32, true>

export type AuthorizationList<
  uint32 = number,
  signed extends boolean = false,
> = readonly Authorization<uint32, signed>[]
export type SignedAuthorizationList<uint32 = number> =
  readonly SignedAuthorization<uint32>[]

export type SerializedAuthorization = readonly [
  chainId: Hex,
  address: Hex,
  nonce: Hex,
  yParity: Hex,
  r: Hex,
  s: Hex,
]

export type SerializedAuthorizationList = readonly SerializedAuthorization[]
