import { describe, expect, test } from 'vitest'
import { baycContractConfig } from '../_test/abis'
import { errorsExampleABI } from '../_test/generated'
import { BaseError } from './base'
import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  RawContractError,
} from './contract'

describe('ContractFunctionExecutionError', () => {
  test('default', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Function:  totalSupply()

      Version: viem@1.0.2]
    `)
  })

  test('args: contractAddress', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'totalSupply',
        contractAddress: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract:  0x0000000000000000000000000000000000000000
      Function:  totalSupply()

      Version: viem@1.0.2]
    `)
  })

  test('args: args', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        contractAddress: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract:  0x0000000000000000000000000000000000000000
      Function:  mintApe(uint256 numberOfTokens)
      Arguments:        (1)

      Version: viem@1.0.2]
    `)
  })

  test('args: docsPath', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        contractAddress: '0x0000000000000000000000000000000000000000',
        docsPath: '/docs',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract:  0x0000000000000000000000000000000000000000
      Function:  mintApe(uint256 numberOfTokens)
      Arguments:        (1)

      Docs: https://viem.sh/docs
      Version: viem@1.0.2]
    `)
  })

  test('args: sender', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        contractAddress: '0x0000000000000000000000000000000000000000',
        sender: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract:  0x0000000000000000000000000000000000000000
      Function:  mintApe(uint256 numberOfTokens)
      Arguments:        (1)
      Sender:    0x0000000000000000000000000000000000000000

      Version: viem@1.0.2]
    `)
  })

  test('cause: metaMessages', () => {
    expect(
      new ContractFunctionExecutionError(
        new BaseError('Internal error.', { metaMessages: ['foo', 'bar'] }),
        {
          abi: baycContractConfig.abi,
          functionName: 'totalSupply',
          contractAddress: '0x0000000000000000000000000000000000000000',
        },
      ),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      foo
      bar
       
      Contract:  0x0000000000000000000000000000000000000000
      Function:  totalSupply()

      Version: viem@1.0.2]
    `)
  })

  test('no message', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError(''), {
        abi: baycContractConfig.abi,
        functionName: 'foo',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: An unknown error occurred while executing the contract function "foo".


      Version: viem@1.0.2]
    `)
  })

  test('function does not exist', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'foo',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.


      Version: viem@1.0.2]
    `)
  })
})

describe('ContractFunctionRevertedError', () => {
  test('default', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: errorsExampleABI,
        message: 'oh no',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      oh no

      Version: viem@1.0.2]
    `)
  })

  test('data: Error(string)', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: errorsExampleABI,
        data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022456e756d657261626c655365743a20696e646578206f7574206f6620626f756e6473000000000000000000000000000000000000000000000000000000000000',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      EnumerableSet: index out of bounds

      Version: viem@1.0.2]
    `)
  })

  test('data: Panic(uint256)', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: errorsExampleABI,
        data: '0x4e487b710000000000000000000000000000000000000000000000000000000000000001',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      An \`assert\` condition failed.

      Version: viem@1.0.2]
    `)
  })

  test('data: custom error', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: errorsExampleABI,
        data: '0xdb731cf4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000',
        functionName: 'customComplexError',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "customComplexError" reverted.

      Error:     ComplexError((address sender, uint256 bar), string message, uint256 number)
      Arguments:             ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)

      Version: viem@1.0.2]
    `)
  })

  test('data: zero data', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: errorsExampleABI,
        data: '0x',
        functionName: 'customComplexError',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "customComplexError" reverted.

      Version: viem@1.0.2]
    `)
  })
})
