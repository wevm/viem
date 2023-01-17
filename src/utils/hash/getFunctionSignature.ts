import { hashFunction } from './hashFunction'

export const getFunctionSignature = (fn: string) =>
  hashFunction(fn).slice(0, 10)
