import { describe, expect, test } from 'vitest'
import { RpcRequestError } from '../../../errors/request.js'
import {
  AccessKeyExpiredError,
  AccessKeyInvalidAuthorizationError,
  AccessKeyInvalidSignatureError,
  AccessKeyNotAuthorizedError,
  AccessKeyRevokedError,
} from '../../errors.js'
import { getAccessKeyError } from './getAccessKeyError.js'

function rpcError(message: string) {
  return new RpcRequestError({
    body: { method: 'eth_sendRawTransaction', params: [] },
    error: { code: -32000, message },
    url: 'http://localhost',
  })
}

describe('getAccessKeyError', () => {
  test('classifies access key node errors', () => {
    expect(
      getAccessKeyError(rpcError('keychain validation failed: KeyExpired()')),
    ).toBeInstanceOf(AccessKeyExpiredError)
    expect(
      getAccessKeyError(
        rpcError('keychain validation failed: KeyAlreadyRevoked()'),
      ),
    ).toBeInstanceOf(AccessKeyRevokedError)
    expect(
      getAccessKeyError(rpcError('keychain validation failed: KeyNotFound()')),
    ).toBeInstanceOf(AccessKeyNotAuthorizedError)
    expect(
      getAccessKeyError(
        rpcError('failed to recover access key address from signature'),
      ),
    ).toBeInstanceOf(AccessKeyInvalidSignatureError)
    expect(
      getAccessKeyError(
        rpcError(
          'keychain validation failed: key authorization key_type does not match the keychain signature type',
        ),
      ),
    ).toBeInstanceOf(AccessKeyInvalidAuthorizationError)
  })

  test('does not classify access key policy denials', () => {
    expect(
      getAccessKeyError(
        rpcError('keychain validation failed: SpendingLimitExceeded()'),
      ),
    ).toBeUndefined()
    expect(
      getAccessKeyError(
        rpcError('keychain validation failed: CallNotAllowed()'),
      ),
    ).toBeUndefined()
  })
})
