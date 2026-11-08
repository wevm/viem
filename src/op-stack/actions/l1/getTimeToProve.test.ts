import { afterAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as opStack from '~test/opStack.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

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

const disputeGameReceipt = opStack.getReceipt({
  blockNumber: 144_991_160n,
  logs: [],
  transactionHash:
    '0x71490b686eaefd6e20d05aeb3feb898bfc7801e50b967d2f9eb5a057b8a7e855',
})

const legacyReceipt = opStack.getReceipt({
  blockNumber: 113_388_533n,
  logs: [],
  transactionHash:
    '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
})

test('estimates a modern proof', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const time = await Actions.l1.getTimeToProve(client, {
    receipt: disputeGameReceipt,
    targetChain: optimism,
  })

  expect(time).toMatchInlineSnapshot(`
    {
      "interval": 3615,
      "seconds": 0,
    }
  `)
}, 60_000)

test('estimates a legacy proof', async () => {
  // A fresh client skips the portal version cached by the modern case.
  const client = Client.create({
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  await CoreActions.state.reset(client, {
    blockNumber: 18_772_363n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const time = await Actions.l1.getTimeToProve(client, {
    receipt: legacyReceipt,
    targetChain: optimism,
  })

  expect(time).toMatchInlineSnapshot(`
    {
      "interval": 3600,
      "seconds": 0,
    }
  `)
}, 60_000)

// Super-root games (game type 9) anchor on L2 timestamps.
const superRootBlockNumber = 26_270_300n

// L2 timestamp newer than the latest game at `superRootBlockNumber`.
const superRootPendingReceipt = opStack.getWithdrawalReceipt({
  blockNumber: 0n,
  blockTimestamp: 1_792_936_085n,
  transactionHash:
    '0xdab8c1862755454ce77526f02c11dfda79687cb4838a47778f1543123ab205f6',
  withdrawalHash:
    '0x7e3c682907ae38aefbca24b93ffa687d022051bb0ea38d3010de94d20354ebac',
})

const superRootReceiptWithoutTimestamp = opStack.getWithdrawalReceipt({
  blockNumber: 0n,
  transactionHash:
    '0xdab8c1862755454ce77526f02c11dfda79687cb4838a47778f1543123ab205f6',
  withdrawalHash:
    '0x7e3c682907ae38aefbca24b93ffa687d022051bb0ea38d3010de94d20354ebac',
})

test('estimates a super-root proof from the receipt L2 timestamp', async () => {
  // A fresh client skips the portal version cached by earlier cases.
  const client = Client.create({
    chain: mainnet,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  await CoreActions.state.reset(client, {
    blockNumber: superRootBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  const { interval, seconds } = await Actions.l1.getTimeToProve(client, {
    receipt: superRootPendingReceipt,
    targetChain: optimism,
  })

  expect(interval).toMatchInlineSnapshot(`3618`)
  expect(seconds).toBeGreaterThan(0)
}, 60_000)

test('rejects a super-root receipt without an L2 timestamp', async () => {
  await CoreActions.state.reset(client, {
    blockNumber: superRootBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })

  await expect(
    Actions.l1.getTimeToProve(client, {
      receipt: superRootReceiptWithoutTimestamp,
      targetChain: optimism,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Withdrawal.L2TimestampRequiredError: Dispute game type 9 anchors on L2 timestamps, so the L2 timestamp of the withdrawal is required.

    Pass \`l2Timestamp\`, or a receipt whose logs include \`blockTimestamp\`.

    Version: viem@x.x.x]
  `)
}, 60_000)
