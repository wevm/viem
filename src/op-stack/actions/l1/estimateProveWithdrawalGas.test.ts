import { afterAll, beforeEach, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, ContractError, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

import { proveWithdrawalParameters } from './testFixtures.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

beforeEach(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 16_280_770n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

// Instances are shared across test files; restore the default fork.
afterAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

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
  const gas = await Actions.l1.estimateProveWithdrawalGas(client, {
    account: constants.accounts[0].address,
    targetChain: optimism,
    ...proveWithdrawalParameters,
  })

  expect(gas).toMatchInlineSnapshot(`123960n`)
})

liveTest('uses an explicit portal address', async () => {
  const gas = await Actions.l1.estimateProveWithdrawalGas(client, {
    account: constants.accounts[0].address,
    portalAddress: optimism.contracts.portal[1].address,
    ...proveWithdrawalParameters,
  })

  expect(gas).toMatchInlineSnapshot(`123960n`)
})

liveTest('rejects insufficient L1 gas', async () => {
  const error = await getContractError(
    Actions.l1.estimateProveWithdrawalGas(client, {
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
      "shortMessage": "The contract function "proveWithdrawalTransaction" reverted with the following reason:
    Execution reverted with reason: Out of gas: gas required exceeds allowance: 69.",
    }
  `)
})
