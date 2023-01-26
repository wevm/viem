import { slice } from '../data'
import { hashFunction } from './hashFunction'

export const getFunctionSignature = (fn: string) =>
  slice(hashFunction(fn), 0, 4)
