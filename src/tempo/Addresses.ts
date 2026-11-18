import * as Hex from 'ox/Hex'
import * as internal from './internal/zone.js'

export const accountImplementation =
  '0x7702c00000000000000000000000000000000000'
export const accountKeychain = '0xaAAAaaAA00000000000000000000000000000000'
export const accountRegistrar = '0x7702ac0000000000000000000000000000000000'
export const addressRegistry = '0xfdc0000000000000000000000000000000000000'
export const configurableAccount = '0xAACC000000000000000000000000000000000000'
/** Current consensus committee precompile address, used with `Abis.currentCommittee` to read committee members. */
export const currentCommittee = '0xC077e00000000000000000000000000000000000'
export const feeManager = '0xfeec000000000000000000000000000000000000'
export const nonceManager = '0x4e4F4E4345000000000000000000000000000000'
export const ousd = '0x20c0000000000000000000006a37DA5C996874BE'
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
export const zoneInbox = '0x1c00000000000000000000000000000000000001'
export const zoneOutbox = '0x1c00000000000000000000000000000000000002'
export const zonePortalImplementation =
  '0x5AD1000000000000000000000000000000000000'
/**
 * Moderato Zone router, used with `Abis.zoneRouterCallbackData` to move tokens
 * between Zone A and Zone B. It receives a Zone withdrawal and deposits it into
 * the Zone that the callback names.
 */
export const zoneRouter = '0xf9B794e0dCa9BC12AC90067dF792D7aaD33436E4'
export const zoneVerifier = '0x5a56000000000000000000000000000000000000'

/**
 * Returns the Zone portal address for a Zone ID or chain ID.
 *
 * @param id - Zone ID or chain ID.
 * @returns The Zone portal address.
 */
export function zonePortal(id: number): `0x${string}` {
  const zoneId = internal.normalizeId(id)

  // TODO: Remove legacy Zone portal address compatibility.
  if (zoneId === 6 || zoneId === 7) return internal.legacyPortals[zoneId]
  const suffix = Hex.fromNumber(zoneId, { size: 8 }).slice(2)
  return `0x5ad000000000000000000000${suffix}`
}
