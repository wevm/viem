import { afterAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})
const optimismClient = Client.create({
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
})

afterAll(async () => {
  await Promise.all([
    CoreActions.state.reset(client, {
      blockNumber: anvil.mainnet.forkBlockNumber,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
    CoreActions.state.reset(optimismClient, {
      blockNumber: anvil.optimism.forkBlockNumber,
      jsonRpcUrl: anvil.optimism.forkUrl,
    }),
  ])
}, 60_000)

test('returns waiting-to-prove before an output is available', async () => {
  await Promise.all([
    CoreActions.state.reset(client, {
      blockNumber: 19_868_020n,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
    CoreActions.state.reset(optimismClient, {
      blockNumber: 131_027_672n,
      jsonRpcUrl: anvil.optimism.forkUrl,
    }),
  ])
  const receipt = await CoreActions.transaction.getReceipt(optimismClient, {
    hash: '0xb3cd0bf131e97b0339b6abde0aa7636fc87114ec6ff8cec28b5002c851c929a3',
  })

  const status = await Actions.l1.getWithdrawalStatus(client, {
    gameLimit: 1,
    receipt,
    targetChain: optimism,
  })

  expect(status).toMatchInlineSnapshot(`"waiting-to-prove"`)
}, 60_000)

test('returns ready-to-prove for an unproven withdrawal', async () => {
  await Promise.all([
    CoreActions.state.reset(client, {
      blockNumber: anvil.mainnet.forkBlockNumber,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
    CoreActions.state.reset(optimismClient, {
      blockNumber: anvil.optimism.forkBlockNumber,
      jsonRpcUrl: anvil.optimism.forkUrl,
    }),
  ])
  const receipt = await CoreActions.transaction.getReceipt(optimismClient, {
    hash: '0x71490b686eaefd6e20d05aeb3feb898bfc7801e50b967d2f9eb5a057b8a7e855',
  })

  const status = await Actions.l1.getWithdrawalStatus(client, {
    gameLimit: 1,
    receipt,
    targetChain: optimism,
  })

  expect(status).toMatchInlineSnapshot(`"ready-to-prove"`)
}, 60_000)

test('returns waiting-to-finalize for a proven withdrawal', async () => {
  await Promise.all([
    CoreActions.state.reset(client, {
      blockNumber: 22_991_516n,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
    CoreActions.state.reset(optimismClient, {
      blockNumber: 138_895_794n,
      jsonRpcUrl: anvil.optimism.forkUrl,
    }),
  ])
  const receipt = await CoreActions.transaction.getReceipt(optimismClient, {
    hash: '0xd62d19e87e2d6ff23935dd6891a6605562dd1f15bb554ff3cfd31794e167d9ab',
  })

  const status = await Actions.l1.getWithdrawalStatus(client, {
    gameLimit: 1,
    receipt,
    targetChain: optimism,
  })

  expect(status).toMatchInlineSnapshot(`"waiting-to-finalize"`)
}, 60_000)

test('returns finalized for a finalized withdrawal', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 21_890_440n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const status = await Actions.l1.getWithdrawalStatus(client, {
    gameLimit: 0,
    l2BlockNumber: 21_890_440n,
    sender: '0x7F6a4DfFcE8aE3AD8b75a35b6e2FB611b93Ca1DB',
    targetChain: optimism,
    withdrawalHash:
      '0x1CD56A12D477EDB091DDECAC56A29D51AD61A9920BE8FCF1EE62BA00AF2B8E55',
  })

  expect(status).toMatchInlineSnapshot(`"finalized"`)
}, 60_000)

test('rejects a receipt without withdrawals', async () => {
  const receipt = await CoreActions.transaction.getReceipt(optimismClient, {
    hash: '0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023',
  })

  await expect(
    Actions.l1.getWithdrawalStatus(client, {
      receipt,
      targetChain: optimism,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Withdrawal.ReceiptContainsNoWithdrawalsError: The provided transaction receipt with hash "0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023" contains no withdrawals.

    Version: viem@2.52.1]
  `)
})
