import { afterAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as opStack from '~test/opStack.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions, Withdrawal } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

afterAll(
  () =>
    CoreActions.state.reset(client, {
      blockNumber: anvil.mainnet.forkBlockNumber,
      jsonRpcUrl: anvil.mainnet.forkUrl,
    }),
  60_000,
)

const disputeGameReceipt = opStack.getWithdrawalReceipt({
  blockNumber: 144_991_160n,
  transactionHash:
    '0x71490b686eaefd6e20d05aeb3feb898bfc7801e50b967d2f9eb5a057b8a7e855',
  withdrawalHash:
    '0xafc350e242bf7e137e2b46858b4f9d0521e70d69d2a70e1aa598cd6fef40e5ac',
})

const legacyReceipt = opStack.getWithdrawalReceipt({
  blockNumber: 113_388_533n,
  transactionHash:
    '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
  withdrawalHash:
    '0x178f1e0216fb50bef160eb8af7d1d98000026a84371cef4a13d8d79996cc8589',
})

const emptyReceipt = opStack.getReceipt({
  blockNumber: 0n,
  logs: [],
  transactionHash:
    '0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023',
})

test('returns a dispute game and withdrawal', async () => {
  const [withdrawal] = Withdrawal.getWithdrawals({
    logs: disputeGameReceipt.logs,
  })
  if (!withdrawal) throw new Error('Expected a withdrawal.')

  const result = await Actions.l1.waitToProve(client, {
    gameLimit: 1,
    pollingInterval: 10,
    receipt: disputeGameReceipt,
    targetChain: optimism,
  })
  const { withdrawal: withdrawal_, ...rest } = result

  expect(rest).toMatchInlineSnapshot(`
    {
      "game": {
        "extraData": "0x0000000000000000000000000000000000000000000000000000000008a46675",
        "index": 13219n,
        "l2BlockNumber": 144991861n,
        "metadata": "0x0000000000000000693cab5f2f32c96920163131333ed15bc523cd7438759c56",
        "rootClaim": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
        "timestamp": 1765583711n,
        "usesSuperRoots": false,
      },
      "output": {
        "l2BlockNumber": 144991861n,
        "outputIndex": 13219n,
        "outputRoot": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
        "timestamp": 1765583711n,
      },
    }
  `)
  expect(withdrawal_).toEqual(withdrawal)
}, 60_000)

test('returns a legacy output and withdrawal', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 18_772_363n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
  const result = await Actions.l1.waitToProve(client, {
    pollingInterval: 10,
    receipt: legacyReceipt,
    targetChain: optimism,
  })

  expect(result.game).toMatchInlineSnapshot(`
    {
      "extraData": "0x",
      "index": 4529n,
      "l2BlockNumber": 113389063n,
      "metadata": "0x",
      "rootClaim": "0xdc3b54fd33b5d8a60f275ca83c74b625e3942be5b70b2f7f0b9cadd869eb7b1a",
      "timestamp": 1702377887n,
      "usesSuperRoots": false,
    }
  `)
  expect(result.output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 113389063n,
      "outputIndex": 4529n,
      "outputRoot": "0xdc3b54fd33b5d8a60f275ca83c74b625e3942be5b70b2f7f0b9cadd869eb7b1a",
      "timestamp": 1702377887n,
    }
  `)
  expect(result.withdrawal.withdrawalHash).toMatchInlineSnapshot(
    `"0x178f1e0216fb50bef160eb8af7d1d98000026a84371cef4a13d8d79996cc8589"`,
  )
}, 60_000)

test('rejects a receipt without withdrawals', async () => {
  await expect(
    Actions.l1.waitToProve(client, {
      receipt: emptyReceipt,
      targetChain: optimism,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Withdrawal.ReceiptContainsNoWithdrawalsError: The provided transaction receipt with hash "0xecb1c13ee638e5cf6a0977d9ee6910fb7c5188d3dff807fd3e658d1533137023" contains no withdrawals.

    Version: viem@2.52.1]
  `)
})
