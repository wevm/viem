import { presignMessagePrefix } from '../../constants/strings.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex, SignableMessage } from '../../types/misc.js'
import { type ConcatErrorType, concat } from '../data/concat.js'
import {
  type StringToBytesErrorType,
  type ToBytesErrorType,
  stringToBytes,
  toBytes,
} from '../encoding/toBytes.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'

type To = 'hex' | 'bytes'

export type HashMessage<TTo extends To> =
  | (TTo extends 'bytes' ? ByteArray : never)
  | (TTo extends 'hex' ? Hex : never)

export type HashMessageErrorType =
  | ConcatErrorType
  | Keccak256ErrorType
  | StringToBytesErrorType
  | ToBytesErrorType
  | ErrorType

export function hashMessage<TTo extends To = 'hex'>(
  message: SignableMessage,
  to_?: TTo,
): HashMessage<TTo> {
  const messageBytes = (() => {
    if (typeof message === 'string') return stringToBytes(message)
    if (message.raw instanceof Uint8Array) return message.raw
    return toBytes(message.raw)
  })()
  const prefixBytes = stringToBytes(
    `${presignMessagePrefix}${messageBytes.length}`,
  )
  return keccak256(concat([prefixBytes, messageBytes]), to_)
}
