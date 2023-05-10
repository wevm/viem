import type { ByteArray, Hex } from '../../types/misc.js'
import { concat } from '../data/concat.js'
import { stringToBytes } from '../encoding/toBytes.js'
import { keccak256 } from '../hash/keccak256.js'

type To = 'hex' | 'bytes'

export type HashMessage<TTo extends To> =
  | (TTo extends 'bytes' ? ByteArray : never)
  | (TTo extends 'hex' ? Hex : never)

export function hashMessage<TTo extends To = 'hex'>(
  message: string,
  to_?: TTo,
): HashMessage<TTo> {
  const messageBytes = stringToBytes(message)
  const prefixBytes = stringToBytes(
    `\x19Ethereum Signed Message:\n${messageBytes.length}`,
  )
  return keccak256(concat([prefixBytes, messageBytes]), to_)
}
