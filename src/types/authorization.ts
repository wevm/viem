import type { Address } from 'abitype'
import type { Hex, Signature } from './misc.js'
import type { ExactPartial, OneOf } from './utils.js'

export type Authorization<
  uint32 = number,
  signed extends boolean = false,
  supportLegacy extends boolean = true,
> = {
  /** Address of the contract to delegate to. */
  address: Address
  /** Chain ID. */
  chainId: uint32
  /** Nonce of the EOA to delegate to. */
  nonce: uint32
} & (signed extends true
  ? Signature<uint32, supportLegacy>
  : ExactPartial<Signature<uint32, supportLegacy>>)

export type AuthorizationList<
  uint32 = number,
  signed extends boolean = false,
> = readonly Authorization<uint32, signed>[]

export type AuthorizationRequest<uint32 = number> = OneOf<
  | {
      /** Address of the contract to delegate to. */
      address: Address
    }
  | {
      /**
       * Address of the contract to delegate to.
       * @alias `address`
       */
      contractAddress: Address
    }
> & {
  /** Chain ID. */
  chainId: uint32
  /** Nonce of the EOA to delegate to. */
  nonce: uint32
}

export type SignedAuthorization<
  uint32 = number,
  supportLegacy extends boolean = true,
> = Authorization<uint32, true, supportLegacy>

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
