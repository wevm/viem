import {
  formatsByCoinType,
  formatsByName,
  IFormat,
} from '@ensdomains/address-encoder'

export type MulticoinRequest = IFormat

export function multicoinFromName(name: string): MulticoinRequest {
  const format = formatsByName[name]
  if (!format) throw new Error(`Unknown multicoin format from name: ${name}`)
  return format
}

export function multicoinFromCoinId(id: number): MulticoinRequest {
  const format = formatsByCoinType[id]
  if (!format) throw new Error(`Unknown multicoin format from id: ${id}`)
  return format
}
