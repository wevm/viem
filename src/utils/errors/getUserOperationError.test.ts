import { expect, test } from 'vitest'
import { ErrorsExample } from '../../../contracts/generated.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { BaseError } from '../../errors/base.js'
import { RpcRequestError } from '../../errors/request.js'
import { getUserOperationError } from './getUserOperationError.js'

test('default', () => {
  const error = new BaseError('Unknown error')
  const result = getUserOperationError(error, {
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: Unknown error

    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (via error.message)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      message:
        'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        args: [420n],
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (420)
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (via error.data)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      // @ts-expect-error
      data: 'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        args: [420n],
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (420)
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (via error.data.revertData)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      // @ts-expect-error
      data: {
        revertData:
          'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
      },
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        args: [420n],
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (420)
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (via error.data)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      message: 'execution reverted: 0x',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        args: [420n],
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "mint" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "mint",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (420)
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (multiple calls)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      message:
        'execution reverted: 0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
      },
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'approve',
        args: ['0x0000000000000000000000000000000000000000', 420n],
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "mint | approve" reverted with the following reason:
    Token ID is taken

     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (multiple calls)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      message:
        'execution reverted: 0xf9006398000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: wagmiContractConfig.abi,
        functionName: 'approve',
        args: ['0x0000000000000000000000000000000000000000', 420n],
      },
      {
        abi: ErrorsExample.abi,
        to: '0x0000000000000000000000000000000000000000',
        functionName: 'simpleCustomWrite',
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "simpleCustomWrite" reverted.

    Error: SimpleError(string message)
                      (bugger)
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  simpleCustomWrite()
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Version: viem@x.y.z]
  `)
})

test('contract error (multiple calls - unknown error)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      message:
        'execution reverted: 0xdeadbeef000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        to: wagmiContractConfig.address,
        abi: [wagmiContractConfig.abi[1]],
        functionName: 'mint',
      },
      {
        to: wagmiContractConfig.address,
        abi: [wagmiContractConfig.abi[1]],
        functionName: 'approve',
        args: ['0x0000000000000000000000000000000000000000', 420n],
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "mint | approve" reverted with the following signature:
    0xdeadbeef

    Unable to decode signature "0xdeadbeef" as it was not found on the provided ABI.
    Make sure you are using the correct ABI and that the error exists on it.
    You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xdeadbeef.
     
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Docs: https://viem.sh/docs/contract/decodeErrorResult
    Version: viem@x.y.z]
  `)
})

test('contract error (raw call)', () => {
  const error = new BaseError('Unknown error', {
    cause: {
      name: '',
      message:
        'execution reverted: 0xdeadbeef000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
    },
  })
  const result = getUserOperationError(error, {
    calls: [
      {
        data: '0xdeadbeef',
        to: '0x0000000000000000000000000000000000000000',
      },
    ],
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: The contract function "" reverted with the following signature:
    0xdeadbeef

    Unable to decode signature "0xdeadbeef" as it was not found on the provided ABI.
    Make sure you are using the correct ABI and that the error exists on it.
    You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xdeadbeef.
     
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Docs: https://viem.sh/docs/contract/decodeErrorResult
    Version: viem@x.y.z]
  `)
})

test('bundler error', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message:
        'useroperation reverted during simulation with reason: aa13 initcode failed or oog',
    },
    url: '',
  })
  const result = getUserOperationError(error, {
    callData: '0xdeadbeef',
    callGasLimit: 1n,
    nonce: 1n,
    preVerificationGas: 1n,
    verificationGasLimit: 1n,
    signature: '0xdeadbeef',
    sender: '0xdeadbeef',
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 2n,
  })
  expect(result).toMatchInlineSnapshot(`
    [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

    This could arise when:
    - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
    - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
    - Smart Account deployment execution reverted with an error

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef
     
    Request Arguments:
      callData:              0xdeadbeef
      callGasLimit:          1
      factory:               0x0000000000000000000000000000000000000000
      factoryData:           0xdeadbeef
      maxFeePerGas:          0.000000001 gwei
      maxPriorityFeePerGas:  0.000000002 gwei
      nonce:                 1
      preVerificationGas:    1
      sender:                0xdeadbeef
      signature:             0xdeadbeef
      verificationGasLimit:  1

    Details: useroperation reverted during simulation with reason: aa13 initcode failed or oog
    Version: viem@x.y.z]
  `)
})
