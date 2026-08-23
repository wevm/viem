import * as Hex from 'ox/Hex'

export const accountImplementation =
  '0x7702c00000000000000000000000000000000000'
export const accountKeychain = '0xaAAAaaAA00000000000000000000000000000000'
export const accountRegistrar = '0x7702ac0000000000000000000000000000000000'
export const addressRegistry = '0xfdc0000000000000000000000000000000000000'
export const feeManager = '0xfeec000000000000000000000000000000000000'
export const nativeMultisig = '0xAACC000000000000000000000000000000000000'
export const nonceManager = '0x4e4F4E4345000000000000000000000000000000'
export const pathUsd = '0x20c0000000000000000000000000000000000000'
export const receivePolicyGuard = '0xB10C000000000000000000000000000000000000'
export const signatureVerifier = '0x5165300000000000000000000000000000000000'
export const stablecoinDex = '0xdec0000000000000000000000000000000000000'
export const storageCredits = '0x1060000000000000000000000000000000000000'
export const tip20ChannelReserve = '0x4d50500000000000000000000000000000000000'
export const tip20Factory = '0x20fc000000000000000000000000000000000000'
export const tip403Registry = '0x403c000000000000000000000000000000000000'
export const validator = '0xcccccccc00000000000000000000000000000000'
export const validatorV2 = '0xcccccccc00000000000000000000000000000001'
export const zoneFactory = '0x5aF2000000000000000000000000000000000000'
export const zoneMessenger = '0x5A4d000000000000000000000000000000000000'
export const zoneOutbox = '0x1c00000000000000000000000000000000000002'
export const zonePortalImplementation =
  '0x5AD1000000000000000000000000000000000000'
export const zoneVerifier = '0x5a56000000000000000000000000000000000000'

/**
 * Returns the Zone portal address for a Zone ID.
 *
 * @param id - Zone ID.
 * @returns The Zone portal address.
 */
export function zonePortal(id: number): `0x${string}` {
  // TODO: Remove legacy Zone portal address compatibility.
  if (id === 6) return '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23'
  if (id === 7) return '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac'
  const suffix = Hex.fromNumber(id, { size: 8 }).slice(2)
  return `0x5ad000000000000000000000${suffix}`
}
