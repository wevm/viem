import { slice } from '../data'
import { hashAbiItem } from './hashAbiItem'

export const getFunctionSelector = (fn: string) =>
  slice(hashAbiItem(fn, 'function'), 0, 4)
