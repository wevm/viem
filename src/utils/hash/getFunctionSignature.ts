import { type AbiFunction, formatAbiItem } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import {
  type NormalizeSignatureErrorType,
  normalizeSignature,
} from './normalizeSignature.js'

export type GetFunctionSignatureErrorType =
  | NormalizeSignatureErrorType
  | ErrorType

export const getFunctionSignature = (fn_: string | AbiFunction) => {
  const fn = (() => {
    if (typeof fn_ === 'string') return fn_
    return formatAbiItem(fn_)
  })()
  return normalizeSignature(fn)
}
