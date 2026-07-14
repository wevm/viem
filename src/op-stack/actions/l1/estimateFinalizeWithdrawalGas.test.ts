import { beforeEach, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { Actions as CoreActions, Client, ContractError, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

import {
  externalProofSubmitter,
  externalProofWithdrawal,
  finalizedWithdrawal,
} from './testFixtures.js'

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
  const gas = await Actions.l1.estimateFinalizeWithdrawalGas(client, {
    account: constants.accounts[0].address,
    targetChain: optimism,
    withdrawal: finalizedWithdrawal,
  })

  expect(gas).toMatchInlineSnapshot(`32250n`)
})

liveTest('uses an explicit portal address', async () => {
  const gas = await Actions.l1.estimateFinalizeWithdrawalGas(client, {
    account: constants.accounts[0].address,
    portalAddress: optimism.contracts.portal[1].address,
    withdrawal: finalizedWithdrawal,
  })

  expect(gas).toMatchInlineSnapshot(`32250n`)
})

liveTest('estimates for an external proof submitter', async () => {
  await CoreActions.test.state.reset(client, {
    blockNumber: 21_165_285n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  await CoreActions.test.block.increaseTime(client, {
    seconds: 7 * 24 * 60 * 60 + 1,
  })
  await CoreActions.test.block.mine(client, { blocks: 1 })
  const gas = await Actions.l1.estimateFinalizeWithdrawalGas(client, {
    account: constants.accounts[0].address,
    proofSubmitter: externalProofSubmitter,
    targetChain: optimism,
    withdrawal: externalProofWithdrawal,
  })

  expect(gas).toMatchInlineSnapshot(`3574262n`)
})

liveTest('rejects insufficient L1 gas', async () => {
  const error = await getContractError(
    Actions.l1.estimateFinalizeWithdrawalGas(client, {
      account: constants.accounts[0].address,
      gas: 69n,
      targetChain: optimism,
      withdrawal: finalizedWithdrawal,
    }),
  )

  expect({
    name: error.name,
    shortMessage: error.shortMessage,
  }).toMatchInlineSnapshot(`
    {
      "name": "ContractFunctionExecutionError",
      "shortMessage": "The contract function "finalizeWithdrawalTransaction" reverted with the following reason:
    Execution reverted with reason: Out of gas: gas required exceeds allowance: 69.",
    }
  `)
})
