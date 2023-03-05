import { toBytes } from '../encoding'
import { keccak256 } from './keccak256'
import {
  AbiEvent,
  AbiFunction,
  parseAbiItem,
  BaseError as ABITypeError,
} from 'abitype'
import { BaseError } from '../../errors'

const hash = (value: string) => keccak256(toBytes(value))

export function hashAbiItem(def: string, type: 'event' | 'function') {
  let prefix = ''
  switch (type) {
    case 'event':
      prefix = /^event /.test(def) ? '' : 'event '
      break
    case 'function':
      prefix = /^function /.test(def) ? '' : 'function '
      break
  }
  let abiItem: typeof type extends 'function'
    ? AbiFunction & {
        type: 'function'
      }
    : AbiEvent
  try {
    abiItem = parseAbiItem(`${prefix}${def}`) as any
  } catch (error) {
    throw new BaseError(`Failed to hash ABI ${type} "${def}"`, {
      cause: error as ABITypeError,
    })
  }
  const params = abiItem.inputs
  if (!params || params.length === 0) return hash(def.replace(/ /g, ''))
  return hash(`${abiItem.name}(${params.map(({ type }) => type).join(',')})`)
}
