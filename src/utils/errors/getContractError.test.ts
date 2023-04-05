import { describe, expect, test } from 'vitest'

import { accounts } from '../../_test/index.js'
import { baycContractConfig } from '../../_test/abis.js'
import {
  AbiDecodingZeroDataError,
  BaseError,
  RawContractError,
} from '../../errors/index.js'
import { getContractError } from './getContractError.js'

describe('getContractError', () => {
  test('default', () => {
    const error = getContractError(
      new RawContractError({
        message: 'execution reverted: Sale must be active to mint Ape',
        data: '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f53616c65206d7573742062652061637469766520746f206d696e742041706500',
      }),
      {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        sender: accounts[0].address,
      },
    )
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@1.0.2]
    `)
  })

  test('default: rpc', () => {
    const error = getContractError(
      new BaseError('An RPC error occurred', {
        cause: {
          code: 3,
          message: 'execution reverted: Sale must be active to mint Ape',
          data: '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f53616c65206d7573742062652061637469766520746f206d696e742041706500',
        } as unknown as Error,
      }),
      {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        sender: accounts[0].address,
      },
    )
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@1.0.2]
    `)
  })

  test('no data', () => {
    const error = getContractError(
      new BaseError('An RPC error occurred', {
        cause: {
          code: 3,
          message: 'ah no',
        } as unknown as Error,
      }),
      {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        sender: accounts[0].address,
      },
    )
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
      ah no

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      ah no

      Version: viem@1.0.2]
    `)
  })

  test('no message', () => {
    const error = getContractError(
      new BaseError('An RPC error occurred', {
        cause: {
          code: 3,
          data: '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f53616c65206d7573742062652061637469766520746f206d696e742041706500',
        } as unknown as Error,
      }),
      {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        sender: accounts[0].address,
      },
    )
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@1.0.2]
    `)
  })

  test('unknown function', () => {
    const error = getContractError(
      new BaseError('An RPC error occurred', {
        cause: {
          code: 3,
          message: 'execution reverted: Sale must be active to mint Ape',
          data: '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f53616c65206d7573742062652061637469766520746f206d696e742041706500',
        } as unknown as Error,
      }),
      {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        sender: accounts[0].address,
      },
    )
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@1.0.2]
    `)
  })

  test('unknown error', () => {
    const error = getContractError(
      new BaseError('An RPC error occurred', {
        cause: new Error('rarararar i am an error lmaoaoo'),
      }),
      {
        abi: baycContractConfig.abi,
        functionName: 'mintApe',
        args: [1n],
        sender: accounts[0].address,
      },
    )
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: An RPC error occurred

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Details: rarararar i am an error lmaoaoo
      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ViemError: An RPC error occurred

      Details: rarararar i am an error lmaoaoo
      Version: viem@1.0.2]
    `)

    const error2 = getContractError(new BaseError('An RPC error occurred'), {
      abi: baycContractConfig.abi,
      functionName: 'mintApe',
      args: [1n],
      sender: accounts[0].address,
    })
    expect(error2).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: An RPC error occurred

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error2.cause).toMatchInlineSnapshot(`
      [ViemError: An RPC error occurred

      Version: viem@1.0.2]
    `)

    const error3 = getContractError(new BaseError(''), {
      abi: baycContractConfig.abi,
      functionName: 'mintApe',
      args: [1n],
      sender: accounts[0].address,
    })
    expect(error3).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: An unknown error occurred while executing the contract function "mintApe".

      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error3.cause).toMatchInlineSnapshot(`
      [ViemError: An error occurred.

      Version: viem@1.0.2]
    `)
  })

  test('zero data', () => {
    const error = getContractError(new AbiDecodingZeroDataError(), {
      abi: baycContractConfig.abi,
      functionName: 'mintApe',
      args: [1n],
      sender: accounts[0].address,
    })
    expect(error).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mintApe" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "mintApe",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
       
      Contract Call:
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@1.0.2]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionZeroDataError: The contract function "mintApe" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "mintApe",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.

      Version: viem@1.0.2]
    `)
  })
})
