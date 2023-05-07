import {
  extractFunctionName,
  extractFunctionParams,
} from '../contract/extractFunctionParts.js'
import { toBytes } from '../encoding/toBytes.js'

import { keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export function hashFunction(def: string) {
  const name = extractFunctionName(def)
  const params = extractFunctionParams(def)
  if (!params || params.length === 0) return hash(def.replace(/ /g, ''))
  return hash(`${name}(${params.map(({ type }) => type).join(',')})`)
}
