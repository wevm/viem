import { describe, expect, test } from 'vitest'

import { accounts } from '../../../test'
import { baycContractConfig } from '../../../test/abis'
import { BaseError } from '../../errors'
import { getContractError } from './getContractError'

describe('getContractError', () => {
  test('default', () => {
    expect(
      getContractError(
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
      ),
    ).toMatchInlineSnapshot(`
      [ContractMethodExecutionError: Sale must be active to mint Ape
       
      Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      Function:  mintApe(uint256 numberOfTokens)
      Arguments:        (1)

      Details: execution reverted: Sale must be active to mint Ape
      Version: viem@1.0.2]
    `)
  })

  test('default', () => {
    expect(
      getContractError(
        new BaseError('An RPC error occurred', {
          cause: {
            code: 3,
            message: 'execution reverted: Sale must be active to mint Ape',
            data: '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f53616c65206d7573742062652061637469766520746f206d696e742041706500',
          } as unknown as Error,
        }),
        {
          abi: baycContractConfig.abi,
          functionName: 'foo',
          args: [1n],
          sender: accounts[0].address,
        },
      ),
    ).toMatchInlineSnapshot(`
      [ContractMethodExecutionError: Sale must be active to mint Ape
       
      Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Details: execution reverted: Sale must be active to mint Ape
      Version: viem@1.0.2]
    `)
  })

  test('unknown error', () => {
    expect(
      getContractError(
        new BaseError('An RPC error occurred', {
          cause: new Error('rarararar i am an error lmaoaoo'),
        }),
        {
          abi: baycContractConfig.abi,
          functionName: 'foo',
          args: [1n],
          sender: accounts[0].address,
        },
      ),
    ).toMatchInlineSnapshot(`
      [ViemError: An RPC error occurred

      Details: rarararar i am an error lmaoaoo
      Version: viem@1.0.2]
    `)
    expect(
      getContractError(new BaseError('An RPC error occurred'), {
        abi: baycContractConfig.abi,
        functionName: 'foo',
        args: [1n],
        sender: accounts[0].address,
      }),
    ).toMatchInlineSnapshot(`
      [ViemError: An RPC error occurred

      Version: viem@1.0.2]
    `)
  })
})
