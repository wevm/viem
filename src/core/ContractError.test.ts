import { Abi, AbiError, AbiParameters } from 'ox'
import type { Hex } from 'ox'
import { describe, expect, test } from 'vitest'

import { ContractError, Errors, RpcError } from 'viem'

const abi = Abi.from([
  'function totalSupply() view returns (uint256)',
  'function mint(uint256 tokenId)',
  'error ComplexError((address sender, uint256 bar) config, string message, uint256 number)',
  'error SimpleError(string message)',
])

describe('ContractFunctionExecutionError', () => {
  test('default', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(
        new Errors.BaseError('Internal error.'),
        { abi, functionName: 'totalSupply' },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract Call:
        function:  function totalSupply() view returns (uint256)

      Details: Internal error.
      Version: viem@2.52.1]
    `)
  })

  test('args: contractAddress', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(
        new Errors.BaseError('Internal error.'),
        {
          abi,
          contractAddress: '0x0000000000000000000000000000000000000000',
          functionName: 'totalSupply',
        },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function totalSupply() view returns (uint256)

      Details: Internal error.
      Version: viem@2.52.1]
    `)
  })

  test('args: args', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(
        new Errors.BaseError('Internal error.'),
        {
          abi,
          args: [1n],
          contractAddress: '0x0000000000000000000000000000000000000000',
          functionName: 'mint',
        },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function mint(uint256 tokenId)
        args:          (1)

      Details: Internal error.
      Version: viem@2.52.1]
    `)
  })

  test('args: docsPath', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(
        new Errors.BaseError('Internal error.'),
        {
          abi,
          contractAddress: '0x0000000000000000000000000000000000000000',
          docsPath: '/docs',
          functionName: 'totalSupply',
        },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function totalSupply() view returns (uint256)

      Details: Internal error.
      See: https://viem.sh/docs
      Version: viem@2.52.1]
    `)
  })

  test('args: sender', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(
        new Errors.BaseError('Internal error.'),
        {
          abi,
          contractAddress: '0x0000000000000000000000000000000000000000',
          functionName: 'totalSupply',
          sender: '0x0000000000000000000000000000000000000000',
        },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function totalSupply() view returns (uint256)
        sender:    0x0000000000000000000000000000000000000000

      Details: Internal error.
      Version: viem@2.52.1]
    `)
  })

  test('function does not exist', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(
        new Errors.BaseError('Internal error.'),
        { abi, functionName: 'foo' },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.


      Details: Internal error.
      Version: viem@2.52.1]
    `)
  })

  test('cause: metaMessages', () => {
    const cause = new Errors.BaseError('Internal error.', {
      metaMessages: ['Some meta message.'],
    })
    expect(
      new ContractError.ContractFunctionExecutionError(cause, {
        abi,
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Some meta message.
       
      Contract Call:
        function:  function totalSupply() view returns (uint256)

      Details: Internal error.
      Version: viem@2.52.1]
    `)
  })

  test('cause: plain Error message fallback', () => {
    expect(
      new ContractError.ContractFunctionExecutionError(new Error('boom'), {
        abi,
        functionName: 'totalSupply',
      }).message,
    ).toContain('boom')
  })
})

describe('ContractFunctionRevertedError', () => {
  test('default', () => {
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      functionName: 'totalSupply',
      message: 'oh no',
    })
    expect(err).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      oh no

      Version: viem@2.52.1]
    `)
    expect(err.raw).toBeUndefined()
  })

  test('data: Error(string)', () => {
    const data =
      '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022456e756d657261626c655365743a20696e646578206f7574206f6620626f756e6473000000000000000000000000000000000000000000000000000000000000'
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data,
      functionName: 'totalSupply',
    })
    expect(err).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      EnumerableSet: index out of bounds

      Version: viem@2.52.1]
    `)
    expect(err.raw).toEqual(data)
    expect(err.reason).toBe('EnumerableSet: index out of bounds')
  })

  test('data: Panic(uint256)', () => {
    const data =
      '0x4e487b710000000000000000000000000000000000000000000000000000000000000001'
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data,
      functionName: 'totalSupply',
    })
    expect(err).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      An \`assert\` condition failed.

      Version: viem@2.52.1]
    `)
    expect(err.raw).toEqual(data)
  })

  test('data: custom error', () => {
    const data =
      '0xdb731cf4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000'
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data,
      functionName: 'totalSupply',
    })
    expect(err).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted.

      Error: error ComplexError((address sender, uint256 bar) config, string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)

      Version: viem@2.52.1]
    `)
    expect(err.data?.name).toBe('ComplexError')
  })

  test('data: zero data', () => {
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data: '0x',
      functionName: 'totalSupply',
    })
    expect(err).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted.

      Version: viem@2.52.1]
    `)
    expect(err.raw).toEqual('0x')
  })

  test('data: signature not found on ABI', () => {
    const data =
      '0xdb731cfa0000000000000000000000000000000000000000000000000000000000000000'
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data,
      functionName: 'totalSupply',
    })
    expect(err).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following signature:
      0xdb731cfa

      Unable to decode signature "0xdb731cfa" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.

      Version: viem@2.52.1]
    `)
    expect(err.signature).toBe('0xdb731cfa')
  })

  test('data: single-arg custom error unwraps the decoded value', () => {
    const data = AbiError.encode(AbiError.fromAbi(abi, 'SimpleError'), ['nope'])
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data,
      functionName: 'totalSupply',
    })
    expect(err.data?.name).toBe('SimpleError')
    expect(err.data?.args).toEqual(['nope'])
  })

  test('data: zero-arg custom error', () => {
    const abi2 = Abi.from(['error Unauthorized()'])
    const data = AbiError.encode(AbiError.fromAbi(abi2, 'Unauthorized'))
    const err = new ContractError.ContractFunctionRevertedError({
      abi: abi2,
      data,
      functionName: 'totalSupply',
    })
    expect(err.data?.name).toBe('Unauthorized')
    expect(err.message).toContain('error Unauthorized()')
  })

  test('data: undecodable args on known selector', () => {
    // `SimpleError(string)` selector with a bogus string offset so the selector
    // resolves on the ABI but `AbiError.decode` throws (non-`NotFoundError`).
    const data =
      '0xf9006398ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' as Hex.Hex
    const err = new ContractError.ContractFunctionRevertedError({
      abi,
      data,
      functionName: 'totalSupply',
    })
    expect(err.data).toBeUndefined()
    expect(err.signature).toBeUndefined()
    expect(err.cause).toBeDefined()
  })
})

describe('ContractFunctionZeroDataError', () => {
  test('default', () => {
    expect(
      new ContractError.ContractFunctionZeroDataError({
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionZeroDataError: The contract function "totalSupply" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "totalSupply",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.

      Version: viem@2.52.1]
    `)
  })
})

describe('RawContractError', () => {
  test('default', () => {
    const err = new ContractError.RawContractError()
    expect(err.code).toBe(3)
    expect(err.data).toBeUndefined()
  })

  test('args: data + message', () => {
    const err = new ContractError.RawContractError({
      data: '0xdeadbeef',
      message: 'execution reverted',
    })
    expect(err.code).toBe(3)
    expect(err.data).toBe('0xdeadbeef')
    expect(err.message).toContain('execution reverted')
  })
})

describe('fromError', () => {
  // `Error(string)` revert data carrying the reason below.
  const errorStringData =
    '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022456e756d657261626c655365743a20696e646578206f7574206f6620626f756e6473000000000000000000000000000000000000000000000000000000000000' as Hex.Hex
  const errorStringReason = 'EnumerableSet: index out of bounds'

  test('zero data error maps to ContractFunctionZeroDataError', () => {
    const error = new AbiParameters.ZeroDataError()
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBeInstanceOf(
      ContractError.ContractFunctionZeroDataError,
    )
  })

  test('reverted: RawContractError with data', () => {
    const error = new ContractError.RawContractError({
      data: errorStringData,
    })
    const result = ContractError.fromError(error, {
      abi,
      address: '0x0000000000000000000000000000000000000000',
      functionName: 'totalSupply',
    })
    expect(result).toBeInstanceOf(ContractError.ContractFunctionExecutionError)
    const cause = result.cause as ContractError.ContractFunctionRevertedError
    expect(cause).toBeInstanceOf(ContractError.ContractFunctionRevertedError)
    expect(cause.reason).toBe(errorStringReason)
  })

  test('reverted: execution reverted code', () => {
    const error = new ContractError.RawContractError({
      message: 'execution reverted',
    })
    const result = ContractError.fromError(error, {
      abi,
      address: '0x0000000000000000000000000000000000000000',
      functionName: 'totalSupply',
    })
    expect(result).toBeInstanceOf(ContractError.ContractFunctionExecutionError)
    expect(result.cause).toBeInstanceOf(
      ContractError.ContractFunctionRevertedError,
    )
  })

  test('reverted: RpcError.ExecutionRevertedError', () => {
    const error = new RpcError.ExecutionRevertedError({
      cause: new Errors.BaseError('execution reverted'),
    })
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBeInstanceOf(
      ContractError.ContractFunctionRevertedError,
    )
  })

  test('non-revert error passes through as cause', () => {
    const error = new Errors.BaseError('Some other error.')
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBe(error)
  })

  test('reverted: no reason available', () => {
    const error = { code: 3 } as unknown as Error
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    const cause = result.cause as ContractError.ContractFunctionRevertedError
    expect(cause.reason).toBeUndefined()
    expect(result.shortMessage).toBe(
      'The contract function "totalSupply" reverted.',
    )
  })

  test('cause without message falls back to default short message', () => {
    const error = {} as unknown as Error
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.shortMessage).toBe(
      'An unknown error occurred while executing the contract function "totalSupply".',
    )
  })

  test('revert data nested under cause chain', () => {
    const inner = new ContractError.RawContractError({
      data: { data: errorStringData },
    })
    const outer = new Errors.BaseError('wrapper', { cause: inner })
    const result = ContractError.fromError(outer, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBeInstanceOf(
      ContractError.ContractFunctionRevertedError,
    )
  })

  test('reverted: nested data.code', () => {
    const error = Object.assign(new Errors.BaseError('boom'), {
      data: { code: 3 },
    })
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBeInstanceOf(
      ContractError.ContractFunctionRevertedError,
    )
  })

  test('reverted: execution-reverted message (no code)', () => {
    const error = new Errors.BaseError('execution reverted')
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBeInstanceOf(
      ContractError.ContractFunctionRevertedError,
    )
  })

  test('reverted: reason pulled from message (no shortMessage)', () => {
    const error = {
      code: 3,
      message: 'boom reverted',
    } as unknown as Error
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    const cause = result.cause as ContractError.ContractFunctionRevertedError
    expect(cause.reason).toBe('boom reverted')
  })

  test('reverted: reason pulled from nested data.message', () => {
    const error = Object.assign(new Errors.BaseError('execution reverted'), {
      data: { message: 'execution reverted: nested reason' },
    })
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    const cause = result.cause as ContractError.ContractFunctionRevertedError
    expect(cause.reason).toBe('execution reverted: nested reason')
  })

  test('surfaces the underlying call `Request Arguments` meta block', () => {
    const error = Object.assign(new Errors.BaseError('boom'), {
      metaMessages: [
        'Request Arguments:',
        '  to:  0x0000000000000000000000000000000000000000',
      ],
    })
    const result = ContractError.fromError(error, {
      abi,
      functionName: 'totalSupply',
    })
    expect(result.cause).toBe(error)
    expect(result.message).toContain('Request Arguments:')
    expect(result.message).toContain(
      '0x0000000000000000000000000000000000000000',
    )
  })
})
