import type { ByteArray, Hex } from '../../types'
import { concat } from '../data'
import { toBytes } from '../encoding'
import { keccak256 } from './keccak256'

type To = 'hex' | 'bytes'

export type HashMessage<TTo extends To> =
  | (TTo extends 'bytes' ? ByteArray : never)
  | (TTo extends 'hex' ? Hex : never)

export function hashMessage<TTo extends To = 'hex'>(
  data: string,
  to_?: TTo,
): HashMessage<TTo> {
  const dataBytes = toBytes(data)
  const prefixBytes = toBytes(
    `\x19Ethereum Signed Message:\n${dataBytes.length}`,
  )
  return keccak256(concat([prefixBytes, dataBytes]), to_)
}
