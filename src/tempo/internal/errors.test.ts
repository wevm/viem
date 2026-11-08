import { Actions, Errors } from 'viem'
import { Account, Addresses, TempoExecutionError } from 'viem/tempo'
import { AbiError, AbiItem } from 'viem/utils'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo.js'
import * as accessKeyErrors from '../actions/accessKey/errors.js'
import * as dexErrors from '../actions/dex/errors.js'
import * as feeErrors from '../actions/fee/errors.js'
import * as ExecutionError from '../ExecutionError.js'
import { type Context, formatTime, withExecutionError } from './errors.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account })

/** Initcode that reverts with `data`. */
function revertingCode(data: `0x${string}`) {
  const size = ((data.length - 2) / 2).toString(16).padStart(2, '0')
  return `0x60${size}600c60003960${size}6000fd${data.slice(2)}` as const
}

/** Resolver context for a decoded error. Reads are not reached in these cases. */
function getContext(signature: string, context: Partial<Context>) {
  return {
    base: {
      cause: new Errors.BaseError('failed'),
      error: ExecutionError.from(AbiItem.getSelector(signature)),
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
    const data = AbiError.encode(AbiError.from('error Error(string message)'), [
      'nope',
    ])
    const options = { data: revertingCode(data) }

    const error = await withExecutionError(
      () => Actions.call(client, options),
      {
        client,
        parameters: options,
      },
    ).catch((error) => error)

    expect(error).not.toBeInstanceOf(TempoExecutionError)
  })

  test('behavior: decodes a Tempo error from a real revert', async () => {
    const options = {
      data: revertingCode(AbiItem.getSelector('PairDoesNotExist()')),
    }

    const error = await withExecutionError(
      () => Actions.call(client, options),
      {
        client,
        parameters: options,
      },
    ).catch((error) => error)

    expect(error).toBeInstanceOf(TempoExecutionError)
    expect(error.errorName).toMatchInlineSnapshot(`"PairDoesNotExist"`)
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
      await dexErrors.errorResolvers['TickOutOfBounds(int16)']!(context)

    expect(result).toBeUndefined()
  })

  test('behavior: skips fee balance reads for an external fee payer', async () => {
    const context = getContext('InsufficientFeeTokenBalance()', {
      parameters: { feePayer: true },
    })

    const result =
      await feeErrors.errorResolvers['InsufficientFeeTokenBalance()']!(context)

    expect(result).toBeInstanceOf(feeErrors.FeeInsufficientBalanceError)
    expect(
      (result as feeErrors.FeeInsufficientBalanceError).feeToken,
    ).toBeUndefined()
  })

  test('behavior: does not attribute an external fee payer limit to the sender key', async () => {
    const context = getContext('SpendingLimitExceeded()', {
      parameters: { feePayer: true },
      signer: {
        address: account.address,
        accessKey: tempo.accounts[1]!.address,
      },
      validation: true,
    })

    const result =
      await accessKeyErrors.errorResolvers['SpendingLimitExceeded()']!(context)

    expect(result).toBeUndefined()
  })

  test('behavior: reads the expiry and minimum from the pool message', async () => {
    const context = getContext('ExpiryInPast()', {
      details: 'Access key expired: expiry 10 <= min allowed 12',
      parameters: { keyAuthorization: { address: tempo.accounts[1]!.address } },
    })

    const result =
      await accessKeyErrors.errorResolvers['ExpiryInPast()']!(context)

    expect(result).toBeInstanceOf(accessKeyErrors.AccessKeyExpiryInPastError)
    expect(result).toMatchObject({ expiry: 10n, minimum: 12n })
  })
})

describe('formatTime', () => {
  test('behavior: formats times beyond the `Date` range as seconds', () => {
    expect([formatTime(2n ** 64n - 1n), formatTime(1n)]).toMatchInlineSnapshot(`
      [
        "18446744073709551615",
        "1970-01-01T00:00:01.000Z",
      ]
    `)
  })
})
