import type { AbiFunction } from 'abitype'

import { formatAbiItem } from '../abi/formatAbiItem.js'
import {
  extractFunctionName,
  extractFunctionParams,
} from '../contract/extractFunctionParts.js'

export const getFunctionSignature = (fn: string | AbiFunction) => {
  if (typeof fn === 'string') {
    const name = extractFunctionName(fn)
    const params = extractFunctionParams(fn) || []
    return `${name}(${params.map(({ type }) => type).join(',')})`
  }

  return formatAbiItem(fn)
}
