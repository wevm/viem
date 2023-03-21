import type { Hex } from '../../types'
import { hashMessage } from '../../utils'
import { sign } from './sign'

export type SignMessageParameters = {
  message: string
  privateKey: Hex
}
export type SignMessageReturnType = Hex

export async function signMessage({
  message,
  privateKey,
}: SignMessageParameters): Promise<SignMessageReturnType> {
  return sign({ hash: hashMessage(message), privateKey })
}
