import { BaseError, encodeErrorResult, toFunctionSelector } from 'viem'
import { call } from 'viem/actions'
import { Addresses, TempoExecutionError } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import * as accessKeyActions from '../actions/accessKey.js'
import * as dexActions from '../actions/dex.js'
import * as feeActions from '../actions/fee.js'
import * as ExecutionError from '../ExecutionError.js'
import { type Context, formatTime, withExecutionError } from './errors.js'

const account = accounts[0]
const client = getClient({ account })

/** Initcode that reverts with `data`. */
function revertingCode(data: `0x${string}`) {
  const size = ((data.length - 2) / 2).toString(16).padStart(2, '0')
  return `0x60${size}600c60003960${size}6000fd${data.slice(2)}` as const
}

/** Resolver context for a decoded error. Reads are not reached in these cases. */
function getContext(signature: string, context: Partial<Context>) {
  return {
    base: {
      cause: new BaseError('failed'),
      error: ExecutionError.from(toFunctionSelector(signature)),
      hints: [],
    },
    call: undefined,
    client,
    details: '',
    parameters: {},
    signer: { address: account.address, accessKey: undefined },
    validation: false,
    ...context,
  } as Context
}

describe('withExecutionError', () => {
  test('behavior: rethrows Solidity `Error(string)` reverts unchanged', async () => {
    const data = encodeErrorResult({
      abi: [
        {
          type: 'error',
          name: 'Error',
          inputs: [{ type: 'string', name: 'message' }],
        },
      ],
      errorName: 'Error',
      args: ['nope'],
    })

    const error = await withExecutionError(call)(client, {
      data: revertingCode(data),
    }).catch((error) => error)

    expect(error).not.toBeInstanceOf(TempoExecutionError)
    expect(error.name).toBe('CallExecutionError')
  })

  test('behavior: decodes a Tempo error from a real revert', async () => {
    const error = await withExecutionError(call)(client, {
      data: revertingCode(toFunctionSelector('PairDoesNotExist()')),
    }).catch((error) => error)

    expect(error).toBeInstanceOf(TempoExecutionError)
    expect(error.errorName).toBe('PairDoesNotExist')
  })
})

describe('resolvers', () => {
  test('behavior: selector-only data for a parameterized error falls back to the base error', async () => {
    const context = getContext('TickOutOfBounds(int16)', {
      call: {
        address: Addresses.stablecoinDex,
        arg: () => undefined,
        args: [],
        functionName: 'place',
      },
    })

    const result =
      await dexActions.errorResolvers['TickOutOfBounds(int16)']!(context)

    expect(result).toBeUndefined()
  })

  test('behavior: skips fee balance reads for an external fee payer', async () => {
    const context = getContext('InsufficientFeeTokenBalance()', {
      parameters: { feePayer: true },
    })

    const result =
      await feeActions.errorResolvers['InsufficientFeeTokenBalance()']!(context)

    expect(result).toBeInstanceOf(feeActions.FeeInsufficientBalanceError)
    expect((result as feeActions.FeeInsufficientBalanceError).feeToken).toBe(
      undefined,
    )
  })

  test('behavior: does not attribute an external fee payer limit to the sender key', async () => {
    const context = getContext('SpendingLimitExceeded()', {
      parameters: { feePayer: true },
      signer: { address: account.address, accessKey: accounts[1].address },
      validation: true,
    })

    const result =
      await accessKeyActions.errorResolvers['SpendingLimitExceeded()']!(context)

    expect(result).toBeUndefined()
  })

  test('behavior: reads the expiry and minimum from the pool message', async () => {
    const context = getContext('ExpiryInPast()', {
      details: 'Access key expired: expiry 10 <= min allowed 12',
      parameters: { keyAuthorization: { address: accounts[1].address } },
    })

    const result =
      await accessKeyActions.errorResolvers['ExpiryInPast()']!(context)

    expect(result).toBeInstanceOf(accessKeyActions.AccessKeyExpiryInPastError)
    expect(result).toMatchObject({ expiry: 10n, minimum: 12n })
  })
})

describe('formatTime', () => {
  test('behavior: formats times beyond the `Date` range as seconds', () => {
    expect(formatTime(2n ** 64n - 1n)).toBe('18446744073709551615')
    expect(formatTime(1n)).toBe('1970-01-01T00:00:01.000Z')
  })
})
