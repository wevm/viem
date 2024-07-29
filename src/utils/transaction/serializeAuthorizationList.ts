import type { ErrorType } from '../../errors/utils.js'
import type {
  AuthorizationList,
  SerializedAuthorizationList,
} from '../../types/authorization.js'
import { toHex } from '../encoding/toHex.js'
import { toYParitySignatureArray } from './serializeTransaction.js'

export type SerializeAuthorizationListReturnType = SerializedAuthorizationList

export type SerializeAuthorizationListErrorType = ErrorType

/*
 * Serializes an EIP-7702 authorization list.
 */
export function serializeAuthorizationList(
  authorizationList?: AuthorizationList<number, true> | undefined,
): SerializeAuthorizationListReturnType {
  if (!authorizationList || authorizationList.length === 0) return []

  const serializedAuthorizationList = []
  for (const authorization of authorizationList) {
    const { address, chainId, nonce, ...signature } = authorization
    serializedAuthorizationList.push([
      toHex(chainId),
      address,
      [nonce ? toHex(nonce) : '0x'],
      ...toYParitySignatureArray({}, signature),
    ])
  }

  return serializedAuthorizationList as {} as SerializeAuthorizationListReturnType
}
