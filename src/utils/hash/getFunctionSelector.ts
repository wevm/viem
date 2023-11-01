import type { AbiFunction } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import { type SliceErrorType, slice } from '../data/slice.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import {
  type GetFunctionSignatureErrorType,
  getFunctionSignature,
} from './getFunctionSignature.js'
import { type Keccak256ErrorType, keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export type GetFunctionSelectorErrorType =
  | GetFunctionSignatureErrorType
  | Keccak256ErrorType
  | SliceErrorType
  | ToBytesErrorType
  | ErrorType

export const getFunctionSelector = (fn: string | AbiFunction) =>
  slice(hash(getFunctionSignature(fn)), 0, 4)
