import * as Value from 'ox/Value'
import { expect, test } from 'vitest'

import { Account, Actions, Client, http, testActions } from 'viem'

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

test('default: estimates gas for a write function', async () => {
  await setup()
  const gas = await Actions.contract.estimateGas(client, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  expect(gas).toBeTypeOf('bigint')
  expect(gas).toBeGreaterThan(0n)
})

test('account: derives the sender from `client.account`', async () => {
  await setup()
  const withAccount = Client.create({
    account: jsonRpc,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const gas = await Actions.contract.estimateGas(withAccount, {
    abi: generated.Erc721.abi,
    address,
    functionName: 'mint',
  })
  expect(gas).toBeGreaterThan(0n)
})

test('dataSuffix: appends to the encoded calldata (raises gas)', async () => {
  await setup()
  const base = await Actions.contract.estimateGas(client, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  const withSuffix = await Actions.contract.estimateGas(client, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    dataSuffix: '0x12345678',
    functionName: 'mint',
  })
  // The appended (non-zero) calldata bytes cost extra gas.
  expect(withSuffix).toBeGreaterThan(base)
})

test('dataSuffix: applies client.dataSuffix (hex string)', async () => {
  await setup()
  const base = await Actions.contract.estimateGas(client, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  const clientWithSuffix = Client.create({
    dataSuffix: '0x12345678',
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const gas = await Actions.contract.estimateGas(clientWithSuffix, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  expect(gas).toBeGreaterThan(base)
})

test('dataSuffix: applies client.dataSuffix (object format)', async () => {
  await setup()
  const base = await Actions.contract.estimateGas(client, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  const clientWithSuffix = Client.create({
    dataSuffix: { required: true, value: '0x12345678' },
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const gas = await Actions.contract.estimateGas(clientWithSuffix, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  expect(gas).toBeGreaterThan(base)
})

test('dataSuffix: parameter takes precedence over client.dataSuffix', async () => {
  await setup()
  // Param-only suffix on a client without a configured suffix.
  const paramOnly = await Actions.contract.estimateGas(client, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    dataSuffix: '0x12345678',
    functionName: 'mint',
  })
  // Same param suffix on a client whose `dataSuffix` differs but is the same
  // length. Equal gas proves the parameter *replaces* (not appends to) the
  // client suffix.
  const clientWithSuffix = Client.create({
    dataSuffix: '0xaabbccdd',
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const overridden = await Actions.contract.estimateGas(clientWithSuffix, {
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    dataSuffix: '0x12345678',
    functionName: 'mint',
  })
  expect(overridden).toBe(paramOnly)
})

test('decorator: exposed on publicActions', async () => {
  await setup()
  const decorated = client.extend(Actions.publicActions())
  const gas = await decorated.contract.estimateGas({
    abi: generated.Erc721.abi,
    account: jsonRpc,
    address,
    functionName: 'mint',
  })
  expect(gas).toBeGreaterThan(0n)
})

test('error: wraps reverts in a ContractFunctionExecutionError', async () => {
  await setup()
  await expect(() =>
    Actions.contract.estimateGas(client, {
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
