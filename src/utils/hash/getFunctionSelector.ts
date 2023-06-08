import { slice } from '../data/slice.js'
import { AbiFunction } from 'abitype'

import { hashAbiFunction, hashFunction } from './hashFunction.js'

export const getFunctionSelector = (fn: string | AbiFunction) => {
  if (typeof fn === 'string') {
    return slice(hashFunction(fn), 0, 4)
  } else {
    return slice(hashAbiFunction(fn), 0, 4)
  }
}
