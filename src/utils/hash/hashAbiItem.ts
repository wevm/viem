import { toBytes } from '../encoding'
import { keccak256 } from './keccak256'
import { AbiEvent, AbiFunction, parseAbiItem } from 'abitype'

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
  const abiFunction = parseAbiItem(
    `${prefix}${def}`,
  ) as typeof type extends 'function'
    ? AbiFunction & {
        type: 'function'
      }
    : AbiEvent
  const params = abiFunction.inputs
  if (!params || params.length === 0) return hash(def.replace(/ /g, ''))
  return hash(
    `${abiFunction.name}(${params.map(({ type }) => type).join(',')})`,
  )
}
