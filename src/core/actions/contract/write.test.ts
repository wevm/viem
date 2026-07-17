import { Value } from 'ox'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Chain, ContractError, http } from 'viem'
import { Client, testActions } from 'viem'
import { mainnet, optimism } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const { abi } = generated.Erc721
const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpc = Account.from(constants.accounts[0].address)
const source = constants.accounts[0]

async function setup() {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  await testClient.block.setNextBaseFeePerGas({
    baseFeePerGas: Value.fromGwei('10'),
  })
  await testClient.block.mine({ blocks: 1 })
}

const { address } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})

const errors = {
  abi: generated.ErrorsExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
  ).address,
}

const writeExample = {
  abi: generated.WriteExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.WriteExample.bytecode.object,
    })
  ).address,
}

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('mints', async () => {
    await setup()
    const hash = await Actions.contract.write(client, {
      abi,
      account,
      address,
      functionName: 'mint',
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('args: setApprovalForAll', async () => {
    await setup()
    const hash = await Actions.contract.write(client, {
      abi,
      account,
      address,
      args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', true],
      functionName: 'setApprovalForAll',
    })
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })
})

test('account: inferred from client', async () => {
  await setup()
  const client = Client.create({
    account: jsonRpc,
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const hash = await Actions.contract.write(client, {
    abi,
    address,
    functionName: 'mint',
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

test('account: address string', async () => {
  await setup()
  const hash = await Actions.contract.write(client, {
    abi,
    account: source.address,
    address,
    functionName: 'mint',
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

test('behavior: nullish account is wrapped as a contract error', async () => {
  await setup()
  await expect(() =>
    Actions.contract.write(client, {
      abi,
      address,
      functionName: 'mint',
    }),
  ).rejects.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
})

test('behavior: node error is wrapped as a contract error', async () => {
  await setup()
  const error = await Actions.contract
    .write(client, {
      abi,
      account: jsonRpc,
      address,
      functionName: 'mint',
      gas: 1n,
    })
    .then(() => null)
    .catch((error) => error as Error)
  expect(error).toBeInstanceOf(ContractError.ContractFunctionExecutionError)
  // The deployed address depends on the instance's deployment order.
  expect(error?.message.replaceAll(address.toLowerCase(), '0x<address>'))
    .toMatchInlineSnapshot(`
    "The amount of gas (1) provided for the transaction is too low.

    Contract Call:
      address:   0x<address>
      function:  function mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
     
    Request Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      gas:   1
      data:  0x1249c58b
      to:    0x<address>

    Details: intrinsic gas too low
    Version: viem@2.52.1"
  `)
})

test('error: aborted request is not wrapped', async () => {
  await setup()
  const controller = new AbortController()
  controller.abort()
  const error = await Actions.contract
    .write(client, {
      abi,
      account: jsonRpc,
      address,
      functionName: 'mint',
      requestOptions: { signal: controller.signal },
    })
    .catch((error) => error)
  expect(error).not.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
})

test('args: value', async () => {
  await setup()
  const hash = await Actions.contract.write(client, {
    ...writeExample,
    account: local,
    functionName: 'pay',
    value: 1n,
  })
  await testClient.block.mine({ blocks: 1 })
  const transaction = await Actions.transaction.get(client, { hash })
  expect(transaction.value).toBe(1n)
})

test('args: value (default)', async () => {
  await setup()
  const hash = await Actions.contract.write(client, {
    ...writeExample,
    account: local,
    functionName: 'pay',
  })
  await testClient.block.mine({ blocks: 1 })
  const transaction = await Actions.transaction.get(client, { hash })
  expect(transaction.value).toBe(0n)
})

test('overloaded function', async () => {
  await setup()

  const hash = await Actions.contract.write(client, {
    ...writeExample,
    account: local,
    args: [13371337n],
    functionName: 'foo',
  })
  await testClient.block.mine({ blocks: 1 })
  const transaction = await Actions.transaction.get(client, { hash })
  // `foo(uint256)` selector + the encoded argument.
  expect(transaction.input).toMatchInlineSnapshot(
    `"0x2fbebd380000000000000000000000000000000000000000000000000000000000cc07c9"`,
  )

  const hash2 = await Actions.contract.write(client, {
    ...writeExample,
    account: local,
    functionName: 'foo',
  })
  await testClient.block.mine({ blocks: 1 })
  const transaction2 = await Actions.transaction.get(client, { hash: hash2 })
  // `foo()` selector, no arguments.
  expect(transaction2.input).toMatchInlineSnapshot(`"0xc2985578"`)
})

describe('request: from contract.simulate', () => {
  test('broadcasts a simulated request', async () => {
    const { request, result } = await Actions.contract.simulate(client, {
      ...writeExample,
      account: local,
      args: [69n],
      functionName: 'foo',
    })
    expect(result).toBe(69n)

    await setup()
    const hash = await Actions.contract.write(client, request)
    await testClient.block.mine({ blocks: 1 })
    const receipt = await Actions.transaction.getReceipt(client, { hash })
    expect(receipt.status).toBe('success')
  })

  test('overloaded function', async () => {
    const { request, result } = await Actions.contract.simulate(client, {
      ...writeExample,
      account: local,
      args: [2n, 3n],
      functionName: 'foo',
    })
    expect(result).toBe(5n)

    await setup()
    const hash = await Actions.contract.write(client, request)
    await testClient.block.mine({ blocks: 1 })
    const transaction = await Actions.transaction.get(client, { hash })
    // `foo(uint256,uint256)` selector + the encoded arguments.
    expect(transaction.input).toMatchInlineSnapshot(
      `"0x04bc52f800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003"`,
    )
  })

  test('chain mismatch throws', async () => {
    const { request } = await Actions.contract.simulate(client, {
      ...writeExample,
      account: jsonRpc,
      args: [69n],
      functionName: 'foo',
    })
    const mismatched = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const error = (await Actions.contract
      .write(mismatched, request)
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error).toBeInstanceOf(ContractError.ContractFunctionExecutionError)
    expect(error.walk((e) => e instanceof Chain.MismatchError)).toBeInstanceOf(
      Chain.MismatchError,
    )
  })
})

// Write reverts surface during gas estimation (`eth_estimateGas`), which the
// node decodes to a string/panic reason. Custom-error `Details:` lines carry
// anvil's raw (binary) revert payload, so for those assert viem's decoded
// fields instead of a full snapshot (mirrors `read.test.ts`).
describe('reverts', () => {
  test('revert message', async () => {
    await setup()
    await expect(() =>
      Actions.contract.write(client, {
        ...errors,
        account: local,
        functionName: 'revertWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "revertWrite" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0xc80f9da34212736be29fcf9ed26b5951ddcc62bb
        function:  function revertWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
       
      Request Arguments:
        from:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        data:  0x940b8802
        to:    0xc80f9da34212736be29fcf9ed26b5951ddcc62bb

      Details: execution reverted: This is a revert message
      Version: viem@2.52.1]
    `)
  })

  test('panic: assert', async () => {
    await setup()
    await expect(() =>
      Actions.contract.write(client, {
        ...errors,
        account: local,
        functionName: 'assertWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "assertWrite" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0xc80f9da34212736be29fcf9ed26b5951ddcc62bb
        function:  function assertWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
       
      Request Arguments:
        from:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        data:  0x04696152
        to:    0xc80f9da34212736be29fcf9ed26b5951ddcc62bb

      Details: execution reverted: panic: assertion failed (0x01)
      Version: viem@2.52.1]
    `)
  })

  test('panic: overflow', async () => {
    await setup()
    await expect(() =>
      Actions.contract.write(client, {
        ...errors,
        account: local,
        functionName: 'overflowWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0xc80f9da34212736be29fcf9ed26b5951ddcc62bb
        function:  function overflowWrite() returns (uint256)
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
       
      Request Arguments:
        from:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        data:  0xd44de866
        to:    0xc80f9da34212736be29fcf9ed26b5951ddcc62bb

      Details: execution reverted: panic: arithmetic underflow or overflow (0x11)
      Version: viem@2.52.1]
    `)
  })

  test('panic: divide by zero', async () => {
    await setup()
    await expect(() =>
      Actions.contract.write(client, {
        ...errors,
        account: local,
        functionName: 'divideByZeroWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "divideByZeroWrite" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0xc80f9da34212736be29fcf9ed26b5951ddcc62bb
        function:  function divideByZeroWrite() returns (uint256)
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
       
      Request Arguments:
        from:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        data:  0xc66cf133
        to:    0xc80f9da34212736be29fcf9ed26b5951ddcc62bb

      Details: execution reverted: panic: division or modulo by zero (0x12)
      Version: viem@2.52.1]
    `)
  })

  test('require', async () => {
    await setup()
    await expect(() =>
      Actions.contract.write(client, {
        ...errors,
        account: local,
        functionName: 'requireWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "requireWrite" reverted with the following reason:
      Execution reverted for an unknown reason.

      Contract Call:
        address:   0xc80f9da34212736be29fcf9ed26b5951ddcc62bb
        function:  function requireWrite()
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
       
      Request Arguments:
        from:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        data:  0x4a9bc278
        to:    0xc80f9da34212736be29fcf9ed26b5951ddcc62bb

      Details: execution reverted
      Version: viem@2.52.1]
    `)
  })

  test('custom error: with args', async () => {
    await setup()
    const error = (await Actions.contract
      .write(client, {
        ...errors,
        account: local,
        functionName: 'simpleCustomWrite',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    expect(error.shortMessage).toBe(
      'The contract function "simpleCustomWrite" reverted.',
    )
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.name).toBe('ContractFunctionRevertedError')
    expect(cause.data).toMatchInlineSnapshot(`
      {
        "args": [
          "bugger",
        ],
        "name": "SimpleError",
      }
    `)
    expect(cause.metaMessages).toMatchInlineSnapshot(`
      [
        "Error: error SimpleError(string message)",
        "                  (bugger)",
      ]
    `)
  })

  test('custom error: no args', async () => {
    await setup()
    const error = (await Actions.contract
      .write(client, {
        ...errors,
        account: local,
        functionName: 'simpleCustomWriteNoArgs',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.data).toMatchInlineSnapshot(`
      {
        "args": [],
        "name": "SimpleErrorNoArgs",
      }
    `)
  })

  test('custom error: complex', async () => {
    await setup()
    const error = (await Actions.contract
      .write(client, {
        ...errors,
        account: local,
        functionName: 'complexCustomWrite',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.data).toMatchInlineSnapshot(`
      {
        "args": [
          {
            "bar": 69n,
            "sender": "0x0000000000000000000000000000000000000000",
          },
          "bugger",
          69n,
        ],
        "name": "ComplexError",
      }
    `)
  })

  test('custom error: not on abi', async () => {
    await setup()
    const error = (await Actions.contract
      .write(client, {
        ...errors,
        abi: errors.abi.filter((item) => item.name !== 'SimpleError'),
        account: local,
        functionName: 'simpleCustomWrite',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.signature).toBe('0xf9006398')
    expect(cause.metaMessages).toMatchInlineSnapshot(`
      [
        "Unable to decode signature "0xf9006398" as it was not found on the provided ABI.",
        "Make sure you are using the correct ABI and that the error exists on it.",
      ]
    `)
  })
})
