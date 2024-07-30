import { describe, expect, test } from 'vitest'

import { ErrorsExample } from '~contracts/generated.js'
import { baycContractConfig } from '~test/src/abis.js'
import { address } from '~test/src/constants.js'
import { polygon } from '../chains/index.js'

import { BaseError } from './base.js'
import {
  CallExecutionError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
} from './contract.js'

describe('CallExecutionError', () => {
  test('no args', async () => {
    expect(
      new CallExecutionError(new BaseError('error'), {
        account: address.vitalik,
      }),
    ).toMatchInlineSnapshot(`
      [CallExecutionError: error

      Raw Call Arguments:
        from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

      Version: viem@x.y.z]
    `)
  })

  test('w/ base args', async () => {
    expect(
      new CallExecutionError(new BaseError('error'), {
        account: address.vitalik,
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        value: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [CallExecutionError: error

      Raw Call Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 ETH
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })

  test('w/ eip1559 args', async () => {
    expect(
      new CallExecutionError(new BaseError('error'), {
        account: address.vitalik,
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        maxFeePerGas: 420n,
        maxPriorityFeePerGas: 69n,
      }),
    ).toMatchInlineSnapshot(`
      [CallExecutionError: error

      Raw Call Arguments:
        from:                  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:                    0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        data:                  0x123
        gas:                   420
        maxFeePerGas:          0.00000042 gwei
        maxPriorityFeePerGas:  0.000000069 gwei
        nonce:                 69

      Version: viem@x.y.z]
    `)
  })

  test('w/ legacy args', async () => {
    expect(
      new CallExecutionError(new BaseError('error'), {
        account: address.vitalik,
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        gasPrice: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [CallExecutionError: error

      Raw Call Arguments:
        from:      0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:        0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        data:      0x123
        gas:       420
        gasPrice:  0.00000042 gwei
        nonce:     69

      Version: viem@x.y.z]
    `)
  })

  test('w/ chain', async () => {
    expect(
      new CallExecutionError(new BaseError('error'), {
        chain: polygon,
        account: address.vitalik,
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        value: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [CallExecutionError: error

      Raw Call Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 MATIC
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })

  test('w/ metaMessages', async () => {
    expect(
      new CallExecutionError(
        new BaseError('error', { metaMessages: ['omggg!'] }),
        {
          chain: polygon,
          account: address.vitalik,
          to: address.usdcHolder,
          data: '0x123',
          gas: 420n,
          nonce: 69,
          value: 420n,
        },
      ),
    ).toMatchInlineSnapshot(`
      [CallExecutionError: error

      omggg!
       
      Raw Call Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 MATIC
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })
})

describe('ContractFunctionExecutionError', () => {
  test('default', () => {
    expect(
      new ContractFunctionExecutionError(new BaseError('Internal error.'), {
        abi: baycContractConfig.abi,
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: Internal error.

      Contract Call:
        function:  totalSupply()

      Version: viem@x.y.z]
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

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  totalSupply()

      Version: viem@x.y.z]
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

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)

      Version: viem@x.y.z]
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

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)

      Docs: https://viem.sh/docs
      Version: viem@x.y.z]
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

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mintApe(uint256 numberOfTokens)
        args:             (1)
        sender:    0x0000000000000000000000000000000000000000

      Version: viem@x.y.z]
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
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  totalSupply()

      Version: viem@x.y.z]
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


      Version: viem@x.y.z]
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


      Version: viem@x.y.z]
    `)
  })
})

describe('ContractFunctionRevertedError', () => {
  test('default', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: ErrorsExample.abi,
        message: 'oh no',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      oh no

      Version: viem@x.y.z]
    `)
  })

  test('data: Error(string)', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: ErrorsExample.abi,
        data: '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000022456e756d657261626c655365743a20696e646578206f7574206f6620626f756e6473000000000000000000000000000000000000000000000000000000000000',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      EnumerableSet: index out of bounds

      Version: viem@x.y.z]
    `)
  })

  test('data: Panic(uint256)', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: ErrorsExample.abi,
        data: '0x4e487b710000000000000000000000000000000000000000000000000000000000000001',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following reason:
      An \`assert\` condition failed.

      Version: viem@x.y.z]
    `)
  })

  test('data: custom error', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: ErrorsExample.abi,
        data: '0xdb731cf4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000',
        functionName: 'customComplexError',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "customComplexError" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)

      Version: viem@x.y.z]
    `)
  })

  test('data: zero data', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: ErrorsExample.abi,
        data: '0x',
        functionName: 'customComplexError',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "customComplexError" reverted.

      Version: viem@x.y.z]
    `)
  })

  test('data: error signature does not exist on ABI', () => {
    expect(
      new ContractFunctionRevertedError({
        abi: ErrorsExample.abi,
        data: '0xdb731cfa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000',
        functionName: 'totalSupply',
      }),
    ).toMatchInlineSnapshot(`
      [ContractFunctionRevertedError: The contract function "totalSupply" reverted with the following signature:
      0xdb731cfa

      Unable to decode signature "0xdb731cfa" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xdb731cfa.

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })
})
