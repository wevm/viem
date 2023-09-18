import type { AbiEvent, AbiFunction } from 'abitype'

import { getFunctionSignature } from './getFunctionSignature.js'

export const getEventSignature = (fn: string | AbiEvent) => {
  return getFunctionSignature(fn as {} as AbiFunction)
}
