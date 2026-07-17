import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions } from 'viem'
import { Block } from 'viem/op-stack'

const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test

// Block-time derivation assumes the pristine fork tip; sibling test files may
// have mined same-timestamp blocks on the shared instance.
beforeAll(async () => {
  if (process.env.SKIP_GLOBAL_SETUP) return
  await Actions.state.reset(anvil.getClient(anvil.mainnet), {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

liveTest('default', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const latest = await Actions.block.get(client)
  const parent = await Actions.block.get(client, {
    blockNumber: latest.number! - 1n,
  })
  const blockTime = latest.timestamp - parent.timestamp

  await expect(
    Block.getNumberAtTimestamp(client, {
      timestamp: latest.timestamp - blockTime * 10n,
    }),
  ).resolves.toBe(latest.number! - 10n)
})

liveTest('future timestamp', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const latest = await Actions.block.get(client)

  await expect(
    Block.getNumberAtTimestamp(client, { timestamp: latest.timestamp + 1n }),
  ).rejects.toThrow('Timestamp is in the future relative to L2 head.')
})

liveTest('unaligned timestamp', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const latest = await Actions.block.get(client)

  await expect(
    Block.getNumberAtTimestamp(client, { timestamp: latest.timestamp - 1n }),
  ).rejects.toThrow('Timestamp does not align with the L2 block time.')
})

liveTest('timestamp before genesis', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const latest = await Actions.block.get(client)
  const parent = await Actions.block.get(client, {
    blockNumber: latest.number! - 1n,
  })
  const blockTime = latest.timestamp - parent.timestamp

  await expect(
    Block.getNumberAtTimestamp(client, {
      timestamp: latest.timestamp - blockTime * (latest.number! + 1n),
    }),
  ).rejects.toThrow('Timestamp predates L2 genesis.')
})
