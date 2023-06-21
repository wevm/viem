import {
  extractFunctionName,
  extractFunctionParams,
} from '../contract/extractFunctionParts.js'
import { toBytes } from '../encoding/toBytes.js'
import type { AbiEvent, AbiFunction } from 'abitype'

import { keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export function hashFunction(def: string) {
  const name = extractFunctionName(def)
  const params = extractFunctionParams(def) || []
  return hash(`${name}(${params.map(({ type }) => type).join(',')})`)
}

export function hashAbiItem(def: AbiFunction | AbiEvent) {
  return hash(
    `${def.name}(${def.inputs
      .map((input) => {
        const maybeComponents = (input as any).components
        let typeReplacement: string | null = null
        if (input.type === 'tuple' && Array.isArray(maybeComponents)) {
          typeReplacement = `(${maybeComponents.map((a) => a.type).join(',')})`
        }
        return typeReplacement ?? input.type
      })
      .join(',')})`,
  )
}
