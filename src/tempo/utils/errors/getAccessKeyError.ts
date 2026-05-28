import type { BaseError } from '../../../errors/base.js'
import {
  type AccessKeyErrorType,
  AccessKeyExpiredError,
  AccessKeyInvalidAuthorizationError,
  AccessKeyInvalidSignatureError,
  AccessKeyNotAuthorizedError,
  AccessKeyRevokedError,
} from '../../errors.js'

export type GetAccessKeyErrorReturnType = AccessKeyErrorType | undefined

export function getAccessKeyError(err: BaseError): GetAccessKeyErrorReturnType {
  if (
    err instanceof AccessKeyExpiredError ||
    err instanceof AccessKeyRevokedError ||
    err instanceof AccessKeyNotAuthorizedError ||
    err instanceof AccessKeyInvalidSignatureError ||
    err instanceof AccessKeyInvalidAuthorizationError
  )
    return err

  const message = (err.details || '').toLowerCase()

  if (isAccessKeyPolicyError(message)) return undefined
  if (AccessKeyExpiredError.nodeMessage.test(message))
    return new AccessKeyExpiredError({ cause: err })
  if (AccessKeyRevokedError.nodeMessage.test(message))
    return new AccessKeyRevokedError({ cause: err })
  if (AccessKeyInvalidAuthorizationError.nodeMessage.test(message))
    return new AccessKeyInvalidAuthorizationError({ cause: err })
  if (AccessKeyInvalidSignatureError.nodeMessage.test(message))
    return new AccessKeyInvalidSignatureError({ cause: err })
  if (AccessKeyNotAuthorizedError.nodeMessage.test(message))
    return new AccessKeyNotAuthorizedError({ cause: err })

  return undefined
}

function isAccessKeyPolicyError(message: string) {
  return (
    /call not allowed|callnotallowed|invalid call scope|invalidcallscope/.test(
      message,
    ) || /spending limit exceeded|spendinglimitexceeded/.test(message)
  )
}
