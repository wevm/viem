import { describe, expect, test } from 'vitest'

import { baycContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { AbiDecodingZeroDataError } from '../../errors/abi.js'
import { BaseError } from '../../errors/base.js'
import { RawContractError } from '../../errors/contract.js'

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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@x.y.z]
    `)
  })

  test('default: rpc (internal error rpc code)', () => {
    const error = getContractError(
      new BaseError('An RPC error occurred', {
        cause: {
          code: -32603,
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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      ah no

      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "mintApe" reverted with the following reason:
      Sale must be active to mint Ape

      Version: viem@x.y.z]
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
      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [BaseError: An RPC error occurred

      Details: rarararar i am an error lmaoaoo
      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error2.cause).toMatchInlineSnapshot(`
      [BaseError: An RPC error occurred

      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error3.cause).toMatchInlineSnapshot(`
      [BaseError: An error occurred.

      Version: viem@x.y.z]
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

      Version: viem@x.y.z]
    `)
    expect(error.cause).toMatchInlineSnapshot(`
      [ContractFunctionZeroDataError: The contract function "mintApe" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "mintApe",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.

      Version: viem@x.y.z]
    `)
  })
})
