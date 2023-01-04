import { encodeBytes } from '../encoding'
import { keccak256 } from './keccak256'

const paramsRegex = /\(([^)]+)\)/

const hash = (value: string) => keccak256(encodeBytes(value))

export function hashDefinition(def_: string) {
  let def = def_.trim().replace(/((event|function) )/g, '')

  const params = def.match(paramsRegex)?.[1].trim()
  const defName = def.replace(paramsRegex, '')
  if (!params) return hash(def.replace(/ /g, ''))

  const types = params
    .split(',')
    .map((x) => x.trim().split(' ')[0])
    .join(',')
  return hash(`${defName}(${types})`)
}
