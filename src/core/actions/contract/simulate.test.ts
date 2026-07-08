import { Value } from 'ox'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Client, http, testActions } from 'viem'
import { ContractError } from 'viem'
import { mainnet } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

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

const writeExample = {
  abi: generated.WriteExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.WriteExample.bytecode.object,
    })
  ).address,
}

const errors = {
  abi: generated.ErrorsExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
  ).address,
}

test('default: returns result and a write-compatible request', async () => {
  const { request, result } = await Actions.contract.simulate(client, {
    ...writeExample,
    account: jsonRpc,
    args: [69n],
    functionName: 'foo',
  })
  expect(result).toBe(69n)
  expect(request.functionName).toBe('foo')
  expect(request.args).toEqual([69n])

  // The returned request can be broadcast via `contract.write`.
  await setup()
  const hash = await Actions.contract.write(client, request)
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt.status).toBe('success')
})

test('overloaded function: selects the matching overload', async () => {
  const { result } = await Actions.contract.simulate(client, {
    ...writeExample,
    account: jsonRpc,
    args: [2n, 3n],
    functionName: 'foo',
  })
  expect(result).toBe(5n)
})

test('args: value (payable)', async () => {
  const { request, result } = await Actions.contract.simulate(client, {
    ...writeExample,
    account: jsonRpc,
    functionName: 'pay',
    value: 1n,
  })
  expect(result).toBeUndefined()
  expect(request.value).toBe(1n)
})

test('account: inferred from client', async () => {
  const client = Client.create({
    account: jsonRpc,
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const { result } = await Actions.contract.simulate(client, {
    ...writeExample,
    args: [7n],
    functionName: 'foo',
  })
  expect(result).toBe(7n)
})

test('account: address string', async () => {
  const { result } = await Actions.contract.simulate(client, {
    ...writeExample,
    account: source.address,
    args: [7n],
    functionName: 'foo',
  })
  expect(result).toBe(7n)
})

test('account: none', async () => {
  const { result } = await Actions.contract.simulate(client, {
    ...writeExample,
    args: [7n],
    functionName: 'foo',
  })
  expect(result).toBe(7n)
})

test('error: aborted request is not wrapped', async () => {
  const controller = new AbortController()
  controller.abort()
  const error = await Actions.contract
    .simulate(client, {
      ...writeExample,
      account: jsonRpc,
      args: [1n],
      functionName: 'foo',
      requestOptions: { signal: controller.signal },
    })
    .catch((error) => error)
  expect(error).not.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
})

// Simulate runs via `eth_call`, so reverts surface synchronously with decoded
// revert data (mirrors `read.test.ts`). Custom-error `Details:` lines carry
// anvil's raw (binary) payload, so assert viem's decoded fields for those.
describe('reverts', () => {
  test('revert message', async () => {
    await expect(() =>
      Actions.contract.simulate(client, {
        ...errors,
        account: jsonRpc,
        functionName: 'revertWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "revertWrite" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0xf102f0173707c6726543d65fa38025eb72026c37
        function:  function revertWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
       
      Request Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        data:  0x940b8802
        to:    0xf102f0173707c6726543d65fa38025eb72026c37

      Details: execution reverted: This is a revert message
      Version: viem@2.52.1]
    `)
  })

  test('panic: assert', async () => {
    await expect(() =>
      Actions.contract.simulate(client, {
        ...errors,
        account: jsonRpc,
        functionName: 'assertWrite',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "assertWrite" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0xf102f0173707c6726543d65fa38025eb72026c37
        function:  function assertWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
       
      Request Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        data:  0x04696152
        to:    0xf102f0173707c6726543d65fa38025eb72026c37

      Details: execution reverted: panic: assertion failed (0x01)
      Version: viem@2.52.1]
    `)
  })

  test('custom error: with args', async () => {
    const error = (await Actions.contract
      .simulate(client, {
        ...errors,
        account: jsonRpc,
        functionName: 'simpleCustomWrite',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    expect(error.shortMessage).toBe(
      'The contract function "simpleCustomWrite" reverted.',
    )
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.data).toMatchInlineSnapshot(`
      {
        "args": [
          "bugger",
        ],
        "name": "SimpleError",
      }
    `)
  })
})
