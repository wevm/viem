import type { Address } from 'abitype'
import { isAddressEqual } from '../utils/index.js'

export const accountImplementation =
  '0x7702c00000000000000000000000000000000000'
export const accountKeychain = '0xaAAAaaAA00000000000000000000000000000000'
export const accountRegistrar = '0x7702ac0000000000000000000000000000000000'
export const addressRegistry = '0xfdc0000000000000000000000000000000000000'
export const feeManager = '0xfeec000000000000000000000000000000000000'
export const nonceManager = '0x4e4F4E4345000000000000000000000000000000'
export const pathUsd = '0x20c0000000000000000000000000000000000000'
export const receivePolicyGuard = '0xB10C000000000000000000000000000000000000'
export const signatureVerifier = '0x5165300000000000000000000000000000000000'
export const stablecoinDex = '0xdec0000000000000000000000000000000000000'
export const tip20ChannelReserve = '0x4d50500000000000000000000000000000000000'
export const tip20Factory = '0x20fc000000000000000000000000000000000000'
export const tip403Registry = '0x403c000000000000000000000000000000000000'
export const validator = '0xcccccccc00000000000000000000000000000000'
export const zoneOutbox = '0x1c00000000000000000000000000000000000002'

export const tip20AddressPrefix = '0x20c000000000000000000000'

export const systemPrecompiles = [
  accountKeychain,
  accountRegistrar,
  addressRegistry,
  feeManager,
  nonceManager,
  receivePolicyGuard,
  signatureVerifier,
  stablecoinDex,
  tip20ChannelReserve,
  tip20Factory,
  tip403Registry,
  validator,
] as const

export function isTip20Address(address: Address): boolean {
  return address.toLowerCase().startsWith(tip20AddressPrefix)
}

export function isSystemPrecompile(address: Address): boolean {
  return systemPrecompiles.some((precompile) =>
    isAddressEqual(precompile, address),
  )
}
