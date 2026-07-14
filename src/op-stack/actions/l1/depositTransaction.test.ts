import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, ContractError, http } from 'viem'
import { base, mainnet } from 'viem/chains'
import { Hex, Value } from 'viem/utils'
import { Actions, Deposit } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const clientWithoutChain = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
})
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 18_136_086n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  await CoreActions.address.setBalance(client, {
    address: constants.accounts[0].address,
    value: Value.fromEther('10000'),
  })
}, 30_000)

async function getDeposit(hash: Hex.Hex) {
  await CoreActions.block.mine(client, { blocks: 1 })
  const receipt = await CoreActions.transaction.getReceipt(client, { hash })
  const [log] = Deposit.extractTransactionDepositedLogs({
    logs: receipt.logs,
  })
  if (!log) throw new Error('Transaction deposit log not found.')
  return {
    ...Deposit.opaqueDataToDepositData(log.args.opaqueData),
    status: receipt.status,
  }
}

async function getContractError(promise: Promise<unknown>) {
  try {
    await promise
  } catch (error) {
    if (error instanceof ContractError.ContractFunctionExecutionError)
      return error
    throw error
  }
  throw new Error('Expected a contract error.')
}

liveTest('deposits onto the target chain', async () => {
  const hash = await Actions.l1.depositTransaction(client, {
    account: constants.accounts[0].address,
    gas: 420_000n,
    request: { gas: 21_000n, to: constants.accounts[0].address },
    targetChain: base,
  })

  expect(await getDeposit(hash)).toMatchInlineSnapshot(`
    {
      "data": "0x",
      "gas": 21000n,
      "isCreation": false,
      "mint": 0n,
      "status": "success",
      "value": 0n,
    }
  `)
})

liveTest('encodes request fields', async () => {
  const creation = await Actions.l1.depositTransaction(client, {
    account: constants.accounts[0].address,
    gas: 420_000n,
    request: {
      data: '0xdeadbeef',
      gas: 69_420n,
      isCreation: true,
    },
    targetChain: base,
  })
  const mint = await Actions.l1.depositTransaction(client, {
    account: constants.accounts[0].address,
    gas: 420_000n,
    request: {
      gas: 21_000n,
      mint: 1n,
      to: constants.accounts[0].address,
    },
    targetChain: base,
  })
  const value = await Actions.l1.depositTransaction(client, {
    account: constants.accounts[0].address,
    gas: 420_000n,
    request: {
      gas: 21_000n,
      to: constants.accounts[0].address,
      value: 1n,
    },
    targetChain: base,
  })

  expect({
    creation: await getDeposit(creation),
    mint: await getDeposit(mint),
    value: await getDeposit(value),
  }).toMatchInlineSnapshot(`
    {
      "creation": {
        "data": "0xdeadbeef",
        "gas": 69420n,
        "isCreation": true,
        "mint": 0n,
        "status": "success",
        "value": 0n,
      },
      "mint": {
        "data": "0x",
        "gas": 21000n,
        "isCreation": false,
        "mint": 1n,
        "status": "success",
        "value": 1n,
      },
      "value": {
        "data": "0x",
        "gas": 21000n,
        "isCreation": false,
        "mint": 0n,
        "status": "success",
        "value": 1n,
      },
    }
  `)
})

liveTest('uses an explicit portal address', async () => {
  const hash = await Actions.l1.depositTransaction(client, {
    account: constants.accounts[0].address,
    portalAddress: base.contracts.portal[1].address,
    request: { gas: 21_000n, to: constants.accounts[0].address },
  })

  expect(await getDeposit(hash)).toMatchInlineSnapshot(`
    {
      "data": "0x",
      "gas": 21000n,
      "isCreation": false,
      "mint": 0n,
      "status": "success",
      "value": 0n,
    }
  `)
})

liveTest('accepts explicit and nullish transaction options', async () => {
  const explicitGas = await Actions.l1.depositTransaction(client, {
    account: constants.accounts[0].address,
    gas: 420_000n,
    request: { gas: 21_000n, to: constants.accounts[0].address },
    targetChain: base,
  })
  const nullish = await Actions.l1.depositTransaction(clientWithoutChain, {
    account: constants.accounts[0].address,
    chain: null,
    gas: null,
    request: { gas: 21_000n, to: constants.accounts[0].address },
    targetChain: base,
  })

  expect({
    explicitGas: await getDeposit(explicitGas),
    nullish: await getDeposit(nullish),
  }).toMatchInlineSnapshot(`
    {
      "explicitGas": {
        "data": "0x",
        "gas": 21000n,
        "isCreation": false,
        "mint": 0n,
        "status": "success",
        "value": 0n,
      },
      "nullish": {
        "data": "0x",
        "gas": 21000n,
        "isCreation": false,
        "mint": 0n,
        "status": "success",
        "value": 0n,
      },
    }
  `)
})

liveTest('rejects insufficient funds', async () => {
  const error = await getContractError(
    Actions.l1.depositTransaction(client, {
      account: constants.accounts[0].address,
      request: {
        gas: 21_000n,
        mint: Value.fromEther('20000'),
        to: constants.accounts[0].address,
      },
      targetChain: base,
    }),
  )

  expect({
    name: error.name,
    shortMessage: error.shortMessage,
  }).toMatchInlineSnapshot(`
    {
      "name": "ContractFunctionExecutionError",
      "shortMessage": "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.",
    }
  `)
})

liveTest('rejects insufficient L1 gas', async () => {
  const error = await getContractError(
    Actions.l1.depositTransaction(client, {
      account: constants.accounts[0].address,
      gas: 69n,
      request: { gas: 21_000n, to: constants.accounts[0].address },
      targetChain: base,
    }),
  )

  expect({
    name: error.name,
    shortMessage: error.shortMessage,
  }).toMatchInlineSnapshot(`
    {
      "name": "ContractFunctionExecutionError",
      "shortMessage": "The amount of gas (69) provided for the transaction is too low.",
    }
  `)
})
