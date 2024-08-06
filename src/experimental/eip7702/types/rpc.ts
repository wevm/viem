import type { Address } from 'abitype'
import type { Hex, Signature } from '../../../types/misc.js'

export type RpcAuthorization = {
  /** Address of the contract to set as code for the Authority. */
  address: Address
  /** Chain ID to authorize. */
  chainId: Hex
  /** Nonce of the Authority to authorize. */
  nonce: Hex
} & Signature
export type RpcAuthorizationList = readonly RpcAuthorization[]
