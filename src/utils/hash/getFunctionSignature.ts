import { Hex } from '../../types'
import { hashFunction } from './hashFunction'

export const getFunctionSignature = (fn: string): Hex =>
  hashFunction(fn).slice(0, 10)
