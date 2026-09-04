import { Hex } from 'ox'
import { ZoneId } from 'ox/tempo'

const legacyZoneChainIdBase = 4_217_000_000
const legacyZoneChainIdLimit = 4_218_000_000
const mainnetZoneChainIdBase = ZoneId.toChainId(0)
const testnetZoneChainIdBase = ZoneId.toChainId(0, 42_431)
const zoneChainIdLimit = 2 ** 31

/** Address of the account implementation (default delegation target). */
export const accountImplementation =
  '0x7702c00000000000000000000000000000000000'
/** Address of the account keychain precompile. */
export const accountKeychain = '0xaAAAaaAA00000000000000000000000000000000'
/** Address of the account registrar precompile. */
export const accountRegistrar = '0x7702ac0000000000000000000000000000000000'
/** Address of the address registry precompile. */
export const addressRegistry = '0xfdc0000000000000000000000000000000000000'
/** Address of the fee manager precompile. */
export const feeManager = '0xfeec000000000000000000000000000000000000'
export const nativeMultisig = '0xAACC000000000000000000000000000000000000'
/** Address of the nonce manager precompile. */
export const nonceManager = '0x4e4F4E4345000000000000000000000000000000'
/** Address of the PathUSD token. */
export const pathUsd = '0x20c0000000000000000000000000000000000000'
/** Address of the receive-policy guard precompile. */
export const receivePolicyGuard = '0xB10C000000000000000000000000000000000000'
/** Address of the signature verifier precompile. */
export const signatureVerifier = '0x5165300000000000000000000000000000000000'
/** Address of the stablecoin DEX precompile. */
export const stablecoinDex = '0xdec0000000000000000000000000000000000000'
/** Address of the storage credits precompile. */
export const storageCredits = '0x1060000000000000000000000000000000000000'
/** Address of the TIP-20 channel reserve precompile. */
export const tip20ChannelReserve = '0x4d50500000000000000000000000000000000000'
/** Address of the TIP-20 token factory precompile. */
export const tip20Factory = '0x20fc000000000000000000000000000000000000'
/** Address of the TIP-403 registry precompile. */
export const tip403Registry = '0x403c000000000000000000000000000000000000'
/** Address of the validator config precompile. */
export const validator = '0xcccccccc00000000000000000000000000000000'
/** Address of the validator config V2 precompile. */
export const validatorV2 = '0xcccccccc00000000000000000000000000000001'
export const zoneFactory = '0x5aF2000000000000000000000000000000000000'
export const zoneMessenger = '0x5A4d000000000000000000000000000000000000'
/** Address of the zone outbox precompile. */
export const zoneOutbox = '0x1c00000000000000000000000000000000000002'
export const zonePortalImplementation =
  '0x5AD1000000000000000000000000000000000000'
export const zoneVerifier = '0x5a56000000000000000000000000000000000000'

/**
 * Returns the Zone portal address for a Zone ID or chain ID.
 *
 * @param id - Zone ID or chain ID.
 * @returns The Zone portal address.
 */
export function zonePortal(id: number): `0x${string}` {
  const zoneId = normalizeZoneId(id)

  // TODO: Remove legacy Zone portal address compatibility.
  if (zoneId === 6) return '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23'
  if (zoneId === 7) return '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac'
  const suffix = Hex.fromNumber(zoneId, { size: 8 }).slice(2)
  return `0x5ad000000000000000000000${suffix}`
}

function normalizeZoneId(id: number) {
  if (id >= legacyZoneChainIdBase && id < legacyZoneChainIdLimit)
    return id - legacyZoneChainIdBase
  if (id >= testnetZoneChainIdBase && id < zoneChainIdLimit)
    return ZoneId.fromChainId(id, 42_431)
  if (id >= mainnetZoneChainIdBase && id < testnetZoneChainIdBase)
    return ZoneId.fromChainId(id)
  return id
}
