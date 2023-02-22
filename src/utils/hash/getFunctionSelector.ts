import { slice } from '../data'
import { hashFunction } from './hashFunction'

export const getFunctionSelector = (fn: string) => slice(hashFunction(fn), 0, 4)
