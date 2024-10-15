import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'

export type RpcAuthorization = {
  /** Address of the contract to set as code for the Authority. */
  address: Address
  /** Chain ID to authorize. */
  chainId: Hex
  /** Nonce of the Authority to authorize. */
  nonce: Hex
  /** ECDSA r value. */
  r: Hex
  /** ECDSA s value. */
  s: Hex
  /** y parity. */
  yParity: Hex
}
export type RpcAuthorizationList = readonly RpcAuthorization[]
