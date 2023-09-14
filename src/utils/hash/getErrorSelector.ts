import type { AbiError } from 'abitype'
import { hashAbiItem, hashFunction } from './hashFunction.js'

export const getErrorSelector = (error: string | AbiError) => {
  if (typeof error === 'string') return hashFunction(error)
  return hashAbiItem(error)
}
