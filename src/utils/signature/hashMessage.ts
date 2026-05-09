import type { ErrorType } from '../../errors/utils.js'
import type { ByteArray, Hex, SignableMessage } from '../../types/misc.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import { toPrefixedMessage } from './toPrefixedMessage.js'

type To = 'hex' | 'bytes'

export type HashMessageReturnType<to extends To> =
  | (to extends 'bytes' ? ByteArray : never)
  | (to extends 'hex' ? Hex : never)

export type HashMessageErrorType = Keccak256ErrorType | ErrorType

export function hashMessage<to extends To = 'hex'>(
  message: SignableMessage,
  to_?: to | undefined,
): HashMessageReturnType<to> {
  return keccak256(toPrefixedMessage(message), to_)
}
