import { encodeBytes } from '../encoding'
import { extractFunctionName, extractFunctionParams } from '../solidity'
import { keccak256 } from './keccak256'

const hash = (value: string) => keccak256(encodeBytes(value))

export function hashFunction(def: string) {
  const name = extractFunctionName(def)
  const params = extractFunctionParams(def)
  if (!params || params.length === 0) return hash(def.replace(/ /g, ''))
  return hash(`${name}(${params.map(({ type }) => type).join(',')})`)
}
