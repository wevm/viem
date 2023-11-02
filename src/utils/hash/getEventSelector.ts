import type { AbiEvent } from 'abitype'

import type { ErrorType } from '../../errors/utils.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { getEventSignature } from './getEventSignature.js'
import { type Keccak256ErrorType, keccak256 } from './keccak256.js'

const hash = (value: string) => keccak256(toBytes(value))

export type GetEventSelectorErrorType =
  | Keccak256ErrorType
  | ToBytesErrorType
  | ErrorType

export const getEventSelector = (fn: string | AbiEvent) =>
  hash(getEventSignature(fn))
