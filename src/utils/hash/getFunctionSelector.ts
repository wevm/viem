import { slice } from '../data/slice.js'
import type { AbiFunction } from 'abitype'

import { hashAbiItem, hashFunction } from './hashFunction.js'

export const getFunctionSelector = (fn: string | AbiFunction) => {
  if (typeof fn === 'string') return slice(hashFunction(fn), 0, 4)
  return slice(hashAbiItem(fn), 0, 4)
}
