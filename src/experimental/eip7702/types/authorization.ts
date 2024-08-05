import type { Address } from 'abitype'
import type { Hex, Signature } from '../../../types/misc.js'
import type { ExactPartial } from '../../../types/utils.js'

export type Authorization<uint32 = number, signed extends boolean = false> = {
  /** Address of the contract to set as code for the Authority. */
  contractAddress: Address
  /** Chain ID to authorize. */
  chainId: uint32
  /** Nonce of the Authority to authorize. */
  nonce: uint32
} & (signed extends true ? Signature : ExactPartial<Signature>)
export type AuthorizationList<
  uint32 = number,
  signed extends boolean = false,
> = readonly Authorization<uint32, signed>[]

export type SignedAuthorization<uint32 = number> = Authorization<uint32, true>
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
