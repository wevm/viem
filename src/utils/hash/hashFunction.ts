import type { AbiEvent, AbiFunction } from 'abitype'
import { formatAbiItem } from '../abi/formatAbiItem.js'
import { toBytes } from '../encoding/toBytes.js'

import { getFunctionSignature } from './getFunctionSignature.js'
import { keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export function hashFunction(def: string) {
  return hash(getFunctionSignature(def))
}

export function hashAbiItem(abiItem: AbiFunction | AbiEvent) {
  return hash(formatAbiItem(abiItem))
}
