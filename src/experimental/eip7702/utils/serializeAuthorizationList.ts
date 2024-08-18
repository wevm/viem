import type { ErrorType } from '../../../errors/utils.js'
import { toHex } from '../../../utils/encoding/toHex.js'
import { toYParitySignatureArray } from '../../../utils/transaction/serializeTransaction.js'
import type {
  AuthorizationList,
  SerializedAuthorizationList,
} from '../types/authorization.js'

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
    const { contractAddress, chainId, nonce, ...signature } = authorization
    serializedAuthorizationList.push([
      toHex(chainId),
      contractAddress,
      toHex(nonce),
      ...toYParitySignatureArray({}, signature),
    ])
  }

  return serializedAuthorizationList as {} as SerializeAuthorizationListReturnType
}
