import type { AbiEvent, AbiFunction } from 'abitype'
import {
  type FormatAbiItemErrorType,
  formatAbiItem,
} from '../abi/formatAbiItem.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type GetFunctionSignatureErrorType,
  getFunctionSignature,
} from './getFunctionSignature.js'
import { type Keccak256ErrorType, keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export type HashFunctionErrorType =
  | Keccak256ErrorType
  | ToBytesErrorType
  | GetFunctionSignatureErrorType
  | ErrorType

export function hashFunction(def: string) {
  return hash(getFunctionSignature(def))
}

export type HashAbiItemErrorType =
  | Keccak256ErrorType
  | ToBytesErrorType
  | FormatAbiItemErrorType
  | ErrorType

export function hashAbiItem(abiItem: AbiFunction | AbiEvent) {
  return hash(formatAbiItem(abiItem))
}
