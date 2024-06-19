import { presignMessagePrefix } from '../../constants/strings.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex, SignableMessage } from '../../types/misc.js'
import { type ConcatErrorType, concat } from '../data/concat.js'
import { size } from '../data/size.js'
import {
  type BytesToHexErrorType,
  type StringToHexErrorType,
  bytesToHex,
  stringToHex,
} from '../encoding/toHex.js'

export type ToPrefixedMessageErrorType =
  | ConcatErrorType
  | StringToHexErrorType
  | BytesToHexErrorType
  | ErrorType

export function toPrefixedMessage(message_: SignableMessage): Hex {
  const message = (() => {
    if (typeof message_ === 'string') return stringToHex(message_)
    if (typeof message_.raw === 'string') return message_.raw
    return bytesToHex(message_.raw)
  })()
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`)
  return concat([prefix, message])
}
