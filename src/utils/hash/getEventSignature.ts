import type { AbiEvent, AbiFunction } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import {
  type GetFunctionSignatureErrorType,
  getFunctionSignature,
} from './getFunctionSignature.js'

export type GetEventSignatureErrorType =
  | GetFunctionSignatureErrorType
  | ErrorType

export const getEventSignature = (fn: string | AbiEvent) => {
  return getFunctionSignature(fn as {} as AbiFunction)
}
