import { Value } from 'ox'
import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  Chain,
  Client,
  ContractError,
  http,
  testActions,
} from 'viem'
import { mainnet, optimism } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = client.extend(testActions())

const { abi } = generated.Erc721
const local = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpc = Account.from(constants.accounts[0].address)
const source = constants.accounts[0]

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

async function setup() {
  await testClient.block.setAutomine({ enabled: true })
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  await testClient.block.setNextBaseFeePerGas({
    baseFeePerGas: Value.fromGwei('10'),
  })
  await testClient.block.mine({ blocks: 1 })
}

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('mints and returns the receipt', async () => {
    await setup()
    const receipt = await Actions.contract.writeSync(client, {
      abi,
      account,
      address,
      functionName: 'mint',
      pollingInterval: 50,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('args: setApprovalForAll', async () => {
    await setup()
    const receipt = await Actions.contract.writeSync(client, {
      abi,
      account,
      address,
      args: ['0x70997970c51812dc3a010c7d01b50e0d17dc79c8', true],
      functionName: 'setApprovalForAll',
      pollingInterval: 50,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })
})

test('account: inferred from client', async () => {
  await setup()
  const client = Client.create({
    account: jsonRpc,
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const receipt = await Actions.contract.writeSync(client, {
    abi,
    address,
    functionName: 'mint',
    pollingInterval: 50,
  })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('account: address string', async () => {
  await setup()
  const receipt = await Actions.contract.writeSync(client, {
    abi,
    account: source.address,
    address,
    functionName: 'mint',
    pollingInterval: 50,
  })
  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('behavior: missing account is wrapped as a contract error', async () => {
  await setup()
  await expect(() =>
    Actions.contract.writeSync(client, {
      abi,
      address,
      functionName: 'mint',
    }),
  ).rejects.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
})

test('behavior: node error is wrapped as a contract error', async () => {
  await setup()
  await expect(() =>
    Actions.contract.writeSync(client, {
      abi,
      account: jsonRpc,
      address,
      functionName: 'mint',
      gas: 1n,
      pollingInterval: 50,
    }),
  ).rejects.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
})

test('error: aborted request is not wrapped', async () => {
  await setup()
  const controller = new AbortController()
  controller.abort()
  const error = await Actions.contract
    .writeSync(client, {
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
  const receipt = await Actions.contract.writeSync(client, {
    ...writeExample,
    account: local,
    functionName: 'pay',
    value: 1n,
  })
  const transaction = await Actions.transaction.get(client, {
    hash: receipt.transactionHash,
  })
  expect(transaction.value).toBe(1n)
})

test('args: value (default)', async () => {
  await setup()
  const receipt = await Actions.contract.writeSync(client, {
    ...writeExample,
    account: local,
    functionName: 'pay',
  })
  const transaction = await Actions.transaction.get(client, {
    hash: receipt.transactionHash,
  })
  expect(transaction.value).toBe(0n)
})

test('overloaded function', async () => {
  await setup()
  const receipt = await Actions.contract.writeSync(client, {
    ...writeExample,
    account: local,
    args: [13371337n],
    functionName: 'foo',
  })
  const transaction = await Actions.transaction.get(client, {
    hash: receipt.transactionHash,
  })
  expect(transaction.input).toMatchInlineSnapshot(
    `"0x2fbebd380000000000000000000000000000000000000000000000000000000000cc07c9"`,
  )

  const receipt2 = await Actions.contract.writeSync(client, {
    ...writeExample,
    account: local,
    functionName: 'foo',
  })
  const transaction2 = await Actions.transaction.get(client, {
    hash: receipt2.transactionHash,
  })
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
    const receipt = await Actions.contract.writeSync(client, request)
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
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
    const receipt = await Actions.contract.writeSync(client, request)
    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
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
      .writeSync(mismatched, request)
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error).toBeInstanceOf(ContractError.ContractFunctionExecutionError)
    expect(error.walk((e) => e instanceof Chain.MismatchError)).toBeInstanceOf(
      Chain.MismatchError,
    )
  })
})

describe('reverts', () => {
  test.each([
    ['revertWrite'],
    ['assertWrite'],
    ['overflowWrite'],
    ['divideByZeroWrite'],
    ['requireWrite'],
  ] as const)('%s', async (functionName) => {
    await setup()
    await expect(() =>
      Actions.contract.writeSync(client, {
        ...errors,
        account: local,
        functionName,
      }),
    ).rejects.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
  })

  test('custom error: with args', async () => {
    await setup()
    const error = (await Actions.contract
      .writeSync(client, {
        ...errors,
        account: local,
        functionName: 'simpleCustomWrite',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
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

  test('custom error: no args', async () => {
    await setup()
    const error = (await Actions.contract
      .writeSync(client, {
        ...errors,
        account: local,
        functionName: 'simpleCustomWriteNoArgs',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
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
      .writeSync(client, {
        ...errors,
        account: local,
        functionName: 'complexCustomWrite',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
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
})
