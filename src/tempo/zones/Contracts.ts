import * as Addresses from '../Addresses.js'
import * as Abis from './Abis.js'

export const factory = {
  address: Addresses.zoneFactory,
  abi: Abis.zoneFactory,
} as const

export const messenger = {
  address: Addresses.zoneMessenger,
  abi: Abis.zoneMessenger,
} as const

export const outbox = {
  address: Addresses.zoneOutbox,
  abi: Abis.zoneOutbox,
} as const

export const portalImplementation = {
  address: Addresses.zonePortalImplementation,
  abi: Abis.zonePortal,
} as const

export const verifier = {
  address: Addresses.zoneVerifier,
  abi: Abis.zoneVerifier,
} as const

/** Fixed system contracts used by the Tempo Zone protocol. */
export const systemContracts = [
  factory,
  messenger,
  outbox,
  portalImplementation,
  verifier,
] as const
