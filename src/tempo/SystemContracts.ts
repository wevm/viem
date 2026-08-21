import type { Address } from 'abitype'
import { isAddress } from '../utils/address/isAddress.js'
import * as Addresses from './Addresses.js'
import { isZonePortalAddress } from './zones/portal.js'

/** Fixed protocol-managed contract addresses exported by Tempo. */
export const addresses = Object.values(Addresses)

const addressSet = new Set(addresses.map((address) => address.toLowerCase()))

/** Returns whether an address is a fixed or deterministic Tempo system contract. */
export function isSystemContract(address: string): address is Address {
  return (
    isAddress(address) &&
    (addressSet.has(address.toLowerCase()) || isZonePortalAddress(address))
  )
}
