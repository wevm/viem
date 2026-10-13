import {
  BaseError,
  createClient,
  custom,
  encodeErrorResult,
  RawContractError,
  toFunctionSelector,
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { Account, TempoExecutionError } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as accessKeyActions from '../actions/accessKey.js'
import { formatTime, withExecutionError } from './errors.js'

const root = privateKeyToAccount(generatePrivateKey())
const accessKey = Account.fromP256(generatePrivateKey(), { access: root })
// Reads fail, so resolvers fall back to what the error and call carry.
const client = createClient({
  account: accessKey,
  transport: custom({
    request: async () => {
      throw new Error('offline')
    },
  }),
})

const fail = (error: Error) =>
  withExecutionError(async (_client: unknown, _parameters: unknown) => {
    throw error
  })

describe('withExecutionError', () => {
  test('behavior: rethrows Solidity built-in errors unchanged', async () => {
    const cause = new RawContractError({
      data: encodeErrorResult({
        abi: [
          {
            type: 'error',
            name: 'Error',
            inputs: [{ type: 'string', name: 'message' }],
          },
        ],
        errorName: 'Error',
        args: ['nope'],
      }),
    })
    await expect(fail(cause)(client, {})).rejects.toBe(cause)
  })

  test('behavior: revert data marks a spending limit failure as the call', async () => {
    const cause = new RawContractError({
      data: toFunctionSelector('SpendingLimitExceeded()'),
    })
    const error = await fail(cause)(client, {}).catch((error) => error)
    expect(error).toBeInstanceOf(
      accessKeyActions.AccessKeySpendingLimitExceededError,
    )
    expect(error.fee).toBe(false)
  })

  test('behavior: a debug-form message without revert data marks the fee payment', async () => {
    const cause = new BaseError('failed', {
      details:
        'execution reverted: Account keychain error: SpendingLimitExceeded(SpendingLimitExceeded)',
    })
    const error = await fail(cause)(client, {}).catch((error) => error)
    expect(error).toBeInstanceOf(
      accessKeyActions.AccessKeySpendingLimitExceededError,
    )
    expect(error.fee).toBe(true)
  })

  test('behavior: keeps keychain errors about another key off the signer', async () => {
    const other = Account.fromP256(generatePrivateKey(), { access: root })
    const cause = new BaseError('failed', {
      details:
        'keychain validation failed: AccountKeychainError(KeyNotFound(KeyNotFound))',
    })
    const error = await fail(cause)(client, {
      keyAuthorization: { address: other.accessKeyAddress },
    }).catch((error) => error)
    expect(error).toBeInstanceOf(TempoExecutionError)
    expect(error).not.toBeInstanceOf(accessKeyActions.AccessKeyError)
  })
})

describe('formatTime', () => {
  test('behavior: formats times beyond the `Date` range as seconds', () => {
    expect(formatTime(2n ** 64n - 1n)).toBe('18446744073709551615')
    expect(formatTime(1n)).toBe('1970-01-01T00:00:01.000Z')
  })
})
