import { AbiError } from 'ox'
import { ContractError as ContractError_ } from 'viem'
import { Abis, ExecutionError } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

// ABI-encoded revert data fixtures.
const insufficientBalanceData =
  '0x832f98b500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000020c0000000000000000000000000000000000001' as const
const unauthorizedData = '0x82b42900' as const
const tokenAlreadyExistsData =
  '0x15ef3a5700000000000000000000000020c0000000000000000000000000000000000001' as const

describe('from', () => {
  test('decodes nested RawContractError data', () => {
    const error = new ContractError_.RawContractError({
      data: { data: unauthorizedData },
    })
    expect(ExecutionError.serialize(ExecutionError.from(error)))
      .toMatchInlineSnapshot(`
      {
        "abiItem": {
          "inputs": [],
          "name": "Unauthorized",
          "type": "error",
        },
        "data": "0x82b42900",
        "errorName": "Unauthorized",
        "message": "Unauthorized.",
      }
    `)
  })

  test('decodes nested data from a plain error object', () => {
    expect(
      ExecutionError.from({
        data: { data: unauthorizedData },
        message: 'reverted',
      }),
    ).toEqual(ExecutionError.from(unauthorizedData))
  })

  test.each(['0xzz', '0x123', 'not-hex'])(
    'ignores invalid nested data and checks the cause: %s',
    (data) => {
      const error = Object.assign(new Error('reverted'), {
        data: { data },
        cause: new ContractError_.RawContractError({ data: unauthorizedData }),
      })
      expect(ExecutionError.serialize(ExecutionError.from(error))).toEqual(
        ExecutionError.serialize(ExecutionError.from(unauthorizedData)),
      )
    },
  )

  test('handles cyclic error objects', () => {
    const error = new Error('reverted')
    error.cause = error
    expect(ExecutionError.serialize(ExecutionError.from(error)))
      .toMatchInlineSnapshot(`
      {
        "errorName": "unknown",
        "message": "reverted",
      }
    `)
  })

  test('accepts a plain error object', () => {
    expect(
      ExecutionError.from({ data: unauthorizedData, message: 'reverted' }),
    ).toMatchObject({
      errorName: 'Unauthorized',
      message: 'Unauthorized.',
    })
    expect(
      ExecutionError.from({ data: '0xdeadbeef', message: 'unknown revert' }),
    ).toEqual({
      data: '0xdeadbeef',
      errorName: 'unknown',
      message: 'unknown revert',
    })
  })

  test('decorates a frozen error without changing its prototype or original fields', () => {
    const cause = new Error('underlying failure')
    const marker = Symbol('marker')
    const error = Object.freeze(
      Object.defineProperties(new TypeError('original message', { cause }), {
        data: { value: unauthorizedData },
        code: { value: -32000 },
        [marker]: { value: 'metadata' },
      }),
    )
    const decorated = ExecutionError.from(error)

    expect(decorated).not.toBe(error)
    expect(decorated).toBeInstanceOf(TypeError)
    expect(Object.getPrototypeOf(decorated)).toBe(Object.getPrototypeOf(error))
    expect(decorated.stack).toBe(error.stack)
    expect(decorated.cause).toBe(cause)
    expect(decorated.toString()).toBe('TypeError: Unauthorized.')
    expect(Object.getOwnPropertyDescriptor(decorated, 'code')).toEqual(
      Object.getOwnPropertyDescriptor(error, 'code'),
    )
    expect(Object.getOwnPropertyDescriptor(decorated, marker)).toEqual(
      Object.getOwnPropertyDescriptor(error, marker),
    )
    expect(Object.keys(decorated)).not.toContain('message')
    expect(error.message).toBe('original message')
    expect(error).not.toHaveProperty('errorName')
  })

  test('preserves plain object properties while replacing execution metadata', () => {
    const original = Object.freeze({
      data: unauthorizedData,
      message: 'original',
      errorName: 'stale',
      requestId: 'request-1',
    })
    const error = ExecutionError.from(original)
    expect(error).toMatchObject({
      message: 'Unauthorized.',
      errorName: 'Unauthorized',
      requestId: 'request-1',
    })
    expect(Object.getPrototypeOf(error)).toBe(Object.prototype)
    expect(original.errorName).toBe('stale')
    expect(original.message).toBe('original')
  })

  test.each(['0x82b42900', '0x82B42900'] as const)(
    'accepts an error selector: %s',
    (selector) => {
      expect(ExecutionError.from(selector)).toEqual({
        abiItem: { type: 'error', name: 'Unauthorized', inputs: [] },
        args: undefined,
        data: selector,
        errorName: 'Unauthorized',
        message: 'Unauthorized.',
      })
    },
  )

  test('identifies a selector without inventing its missing arguments', () => {
    expect(ExecutionError.from('0x832f98b5')).toMatchObject({
      args: undefined,
      data: '0x832f98b5',
      errorName: 'InsufficientBalance',
      message: 'Insufficient balance. Required: {1}, available: {0}.',
    })
  })

  test('decodes arguments from full revert data', () => {
    expect(ExecutionError.from(insufficientBalanceData)).toMatchObject({
      args: [0n, 100000000n, '0x20C0000000000000000000000000000000000001'],
      errorName: 'InsufficientBalance',
      message: 'Insufficient balance. Required: 100000000, available: 0.',
    })
  })

  test.each(['0xdeadbeef', '0x832f98b500', '0x'] as const)(
    'preserves unknown or malformed hex input: %s',
    (data) => {
      expect(ExecutionError.from(data)).toEqual({
        data,
        errorName: 'unknown',
        message: 'Unknown execution error.',
      })
    },
  )

  test('uses the zero-argument InsufficientBalance template', () => {
    expect(
      ExecutionError.from(
        AbiError.encode(
          AbiError.fromAbi(
            [{ type: 'error', name: 'InsufficientBalance', inputs: [] }],
            'InsufficientBalance',
          ),
        ),
      ),
    ).toMatchObject({
      errorName: 'InsufficientBalance',
      message: 'Insufficient balance.',
      args: undefined,
    })
  })

  test.each([
    {
      inputs: [{ type: 'string' }, { type: 'string' }],
      args: ['invalid:port', 'backtrace'],
      message: '"invalid:port" is not a valid IP:port.',
    },
    {
      inputs: [{ type: 'string' }, { type: 'string' }, { type: 'string' }],
      args: ['validator', 'invalid:port', 'backtrace'],
      message: '"invalid:port" is not a valid IP:port for validator.',
    },
  ])(
    'formats the NotIpPort overload: $message',
    ({ inputs, args, message }) => {
      const data = AbiError.encode(
        AbiError.fromAbi(
          [{ type: 'error', name: 'NotIpPort', inputs }],
          'NotIpPort',
        ),
        args,
      )
      expect(ExecutionError.from(data)).toMatchObject({
        errorName: 'NotIpPort',
        args,
        message,
      })
    },
  )

  test('preserves ambiguous human-readable overloads', () => {
    expect(
      ExecutionError.from(
        new Error('execution reverted: NotIpPort(input, backtrace)'),
      ),
    ).toMatchObject({
      errorName: 'unknown',
      message: 'NotIpPort(input, backtrace)',
    })
  })

  test('formats errors added to the core ABI', () => {
    const data = AbiError.encode(
      AbiError.fromAbi(Abis.core, 'InvalidCiphertextLength'),
      [3n, 32n],
    )
    expect(
      ExecutionError.from(Object.assign(new Error('reverted'), { data })),
    ).toMatchObject({
      errorName: 'InvalidCiphertextLength',
      args: [3n, 32n],
      message: 'Invalid ciphertext length. Expected 32, got 3.',
    })
  })

  test('decodes InsufficientBalance from revert data', () => {
    const error = {
      message: 'reverted',
      data: insufficientBalanceData,
    }
    const result = ExecutionError.from(error)
    expect(result).toMatchInlineSnapshot(`
      {
        "abiItem": {
          "inputs": [
            {
              "name": "available",
              "type": "uint256",
            },
            {
              "name": "required",
              "type": "uint256",
            },
            {
              "name": "token",
              "type": "address",
            },
          ],
          "name": "InsufficientBalance",
          "type": "error",
        },
        "args": [
          0n,
          100000000n,
          "0x20C0000000000000000000000000000000000001",
        ],
        "data": "0x832f98b500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000020c0000000000000000000000000000000000001",
        "errorName": "InsufficientBalance",
        "message": "Insufficient balance. Required: 100000000, available: 0.",
      }
    `)
  })

  test('decodes Unauthorized (no args)', () => {
    const error = Object.assign(new Error('reverted'), {
      data: unauthorizedData,
    })
    const result = ExecutionError.from(error)
    expect(result.errorName).toBe('Unauthorized')
    expect(result.message).toBe('Unauthorized.')
  })

  test('decodes TokenAlreadyExists with templated message', () => {
    const error = Object.assign(new Error('reverted'), {
      data: tokenAlreadyExistsData,
    })
    const result = ExecutionError.from(error)
    expect(result.errorName).toBe('TokenAlreadyExists')
    expect(result.message).toBe(
      'Token 0x20C0000000000000000000000000000000000001 already exists.',
    )
  })

  test('extracts revert data from nested cause', () => {
    const inner = Object.assign(new Error('inner'), {
      data: unauthorizedData,
    })
    const error = Object.assign(new Error('outer'), { cause: inner })
    const result = ExecutionError.from(error)
    expect(result.errorName).toBe('Unauthorized')
  })

  test('extracts revert data from nested error property', () => {
    const inner = Object.assign(new Error('inner'), {
      data: insufficientBalanceData,
    })
    const error = Object.assign(new Error('outer'), { error: inner })
    const result = ExecutionError.from(error)
    expect(result.errorName).toBe('InsufficientBalance')
  })

  test.each(['Unauthorized()', 'Unauthorized(something)'])(
    'fallback: extracts %s from a human-readable revert message',
    (message) => {
      const error = new Error(`execution reverted: ${message}`)
      const result = ExecutionError.from(error)
      expect(result.errorName).toBe('unknown')
      expect(result.message).toBe('Unauthorized.')
    },
  )

  test('fallback: uses details property', () => {
    const error = Object.assign(new Error('ignored'), {
      details: 'execution reverted: Unauthorized(x)',
    })
    const result = ExecutionError.from(error)
    expect(result.errorName).toBe('unknown')
    expect(result.message).toBe('Unauthorized.')
  })

  test('fallback: uses shortMessage property', () => {
    const error = Object.assign(new Error('ignored'), {
      shortMessage: 'execution reverted: Unauthorized(x)',
    })
    const result = ExecutionError.from(error)
    expect(result.errorName).toBe('unknown')
    expect(result.message).toBe('Unauthorized.')
  })

  test('unknown error: returns raw message', () => {
    const error = new Error('something went wrong')
    const result = ExecutionError.from(error)
    expect(result.message).toBe('something went wrong')
    expect(result.errorName).toBe('unknown')
  })

  test('unknown error: strips "execution reverted:" prefix', () => {
    const error = new Error('execution reverted: mystery failure')
    const result = ExecutionError.from(error)
    expect(result.message).toBe('mystery failure')
  })

  test('undecodable revert data falls back to raw message', () => {
    const error = Object.assign(new Error('bad revert'), {
      data: '0xdeadbeef',
    })
    const result = ExecutionError.from(error)
    expect(result.message).toBe('bad revert')
    expect(result.errorName).toBe('unknown')
  })
})

describe('serialize', () => {
  test('omits original error properties from RPC output', () => {
    const error = ExecutionError.from(
      Object.assign(new Error('reverted', { cause: new Error('cause') }), {
        data: unauthorizedData,
        requestId: 'request-1',
        retryAfter: 1n,
      }),
    )
    const rpc = ExecutionError.serialize(error)
    expect(rpc).toEqual({
      abiItem: { type: 'error', name: 'Unauthorized', inputs: [] },
      data: unauthorizedData,
      errorName: 'Unauthorized',
      message: 'Unauthorized.',
    })
    expect(() => JSON.stringify(rpc)).not.toThrow()
    expect(error.retryAfter).toBe(1n)
    expect(error.cause).toBeInstanceOf(Error)
  })

  test('serializes InsufficientBalance', () => {
    const parsed = ExecutionError.from(
      Object.assign(new Error(''), { data: insufficientBalanceData }),
    )
    const serialized = ExecutionError.serialize(parsed)
    expect(serialized).toMatchInlineSnapshot(`
      {
        "abiItem": {
          "inputs": [
            {
              "name": "available",
              "type": "uint256",
            },
            {
              "name": "required",
              "type": "uint256",
            },
            {
              "name": "token",
              "type": "address",
            },
          ],
          "name": "InsufficientBalance",
          "type": "error",
        },
        "data": "0x832f98b500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005f5e10000000000000000000000000020c0000000000000000000000000000000000001",
        "errorName": "InsufficientBalance",
        "message": "Insufficient balance. Required: 100000000, available: 0.",
      }
    `)
  })

  test('serializes unknown error', () => {
    const parsed = ExecutionError.from(new Error('boom'))
    const serialized = ExecutionError.serialize(parsed)
    expect(serialized).toMatchInlineSnapshot(`
      {
        "errorName": "unknown",
        "message": "boom",
      }
    `)
  })

  test('serializes error with no args', () => {
    const parsed = ExecutionError.from(
      Object.assign(new Error(''), { data: unauthorizedData }),
    )
    const serialized = ExecutionError.serialize(parsed)
    expect(serialized.errorName).toBe('Unauthorized')
  })
})
