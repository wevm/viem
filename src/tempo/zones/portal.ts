import type { Address } from 'abitype'
import { getAddress } from '../../utils/address/getAddress.js'
import { isAddress } from '../../utils/address/isAddress.js'

const prefix = '5ad000000000000000000000'
const maxZoneId = 2n ** 32n - 1n

/** Returns the deterministic Tempo address for a Zone Portal proxy. */
export function getZonePortalAddress(zoneId: bigint | number): Address {
  const value = BigInt(zoneId)
  if (value < 0n || value > maxZoneId)
    throw new RangeError('Zone ID must fit in an unsigned 32-bit integer.')
  return getAddress(`0x${prefix}${value.toString(16).padStart(16, '0')}`)
}

/** Returns whether an address belongs to the deterministic Zone Portal range. */
export function isZonePortalAddress(address: string): address is Address {
  if (!isAddress(address) || !address.toLowerCase().startsWith(`0x${prefix}`))
    return false
  return BigInt(`0x${address.slice(2 + prefix.length)}`) <= maxZoneId
}

/** Extracts the Zone ID from a deterministic Zone Portal address. */
export function getZonePortalId(address: Address): number | undefined {
  if (!isZonePortalAddress(address)) return undefined
  return Number(BigInt(`0x${address.slice(2 + prefix.length)}`))
}
