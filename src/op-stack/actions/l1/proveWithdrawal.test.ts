import { beforeEach, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, ContractError, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Hex } from 'viem/utils'
import { Actions } from 'viem/op-stack'

import { proveWithdrawalParameters } from './testFixtures.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

beforeEach(async () => {
  await CoreActions.test.state.reset(client, {
    blockNumber: 16_280_770n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

async function getProof(hash: Hex.Hex) {
  await CoreActions.test.block.mine(client, { blocks: 1 })
  const receipt = await CoreActions.transaction.getReceipt(client, { hash })
  return receipt.status
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

liveTest('default', async () => {
  const hash = await Actions.l1.proveWithdrawal(client, {
    account: constants.accounts[0].address,
    targetChain: optimism,
    ...proveWithdrawalParameters,
  })

  expect(await getProof(hash)).toMatchInlineSnapshot(`"success"`)
})

liveTest('accepts nullish chain and gas', async () => {
  const hash = await Actions.l1.proveWithdrawal(client, {
    account: constants.accounts[0].address,
    chain: null,
    gas: null,
    targetChain: optimism,
    ...proveWithdrawalParameters,
  })

  expect(await getProof(hash)).toMatchInlineSnapshot(`"success"`)
})

liveTest('uses an explicit portal address and gas', async () => {
  const hash = await Actions.l1.proveWithdrawal(client, {
    account: constants.accounts[0].address,
    gas: 420_000n,
    portalAddress: optimism.contracts.portal[1].address,
    ...proveWithdrawalParameters,
  })

  expect(await getProof(hash)).toMatchInlineSnapshot(`"success"`)
})

liveTest('rejects insufficient L1 gas', async () => {
  const error = await getContractError(
    Actions.l1.proveWithdrawal(client, {
      account: constants.accounts[0].address,
      gas: 69n,
      targetChain: optimism,
      ...proveWithdrawalParameters,
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
