import type { Address } from 'abitype'
import type { Signature } from './misc.js'

export type Authorization<signed extends boolean = boolean, uint32 = number> = {
  /** Address of the contract to set as code for the Authority. */
  chainId: uint32
  /** Chain ID to authorize. */
  address: Address
  /** Nonce of the Authority to authorize. */
  nonce: uint32
} & (signed extends true ? Signature : {})

export type AuthorizationList<
  signed extends boolean = boolean,
  uint32 = number,
> = readonly Authorization<signed, uint32>[]
