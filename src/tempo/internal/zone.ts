import type { Address } from 'abitype'
import { ZoneId } from 'ox/tempo'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'

const legacyChainIdBase = 4_217_000_000
const legacyChainIdLimit = 4_218_000_000
const mainnetChainIdBase = ZoneId.toChainId(0)
const testnetChainIdBase = ZoneId.toChainId(0, 42_431)
const chainIdLimit = 2 ** 31

// TODO: Remove legacy Zone compatibility.
/**
 * Portals of the legacy moderato Zones A (`6`) and B (`7`), which predate
 * deposit refund recipients and the current encrypted deposit.
 */
export const legacyPortals = {
  6: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
  7: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
} as const

/** Returns whether a portal address is a legacy Zone portal. */
export function isLegacyPortal(address: Address) {
  return Object.values(legacyPortals).some((portal) =>
    isAddressEqual(portal, address),
  )
}

/**
 * Returns the Zone ID for a Zone ID or a Zone chain ID, including the legacy
 * `4_217_000_000` chain ID base.
 */
export function normalizeId(id: number) {
  if (id >= legacyChainIdBase && id < legacyChainIdLimit)
    return id - legacyChainIdBase
  if (id >= testnetChainIdBase && id < chainIdLimit)
    return ZoneId.fromChainId(id, 42_431)
  if (id >= mainnetChainIdBase && id < testnetChainIdBase)
    return ZoneId.fromChainId(id)
  return id
}
