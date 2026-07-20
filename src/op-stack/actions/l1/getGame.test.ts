import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('returns the latest game after an L2 block', async () => {
  const game = await Actions.l1.getGame(client, {
    l2BlockNumber: 144_990_134n,
    limit: 3,
    targetChain: optimism,
  })

  expect(game).toMatchInlineSnapshot(`
    {
      "extraData": "0x0000000000000000000000000000000000000000000000000000000008a46675",
      "index": 13219n,
      "l2BlockNumber": 144991861n,
      "metadata": "0x0000000000000000693cab5f2f32c96920163131333ed15bc523cd7438759c56",
      "rootClaim": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
      "timestamp": 1765583711n,
      "usesSuperRoots": false,
    }
  `)
})

test('supports random selection', async () => {
  const game = await Actions.l1.getGame(client, {
    l2BlockNumber: 144_990_134n,
    limit: 3,
    strategy: 'random',
    targetChain: optimism,
  })

  expect(game).toMatchInlineSnapshot(`
    {
      "extraData": "0x0000000000000000000000000000000000000000000000000000000008a46675",
      "index": 13219n,
      "l2BlockNumber": 144991861n,
      "metadata": "0x0000000000000000693cab5f2f32c96920163131333ed15bc523cd7438759c56",
      "rootClaim": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
      "timestamp": 1765583711n,
      "usesSuperRoots": false,
    }
  `)
})

test('rejects when no newer game exists', async () => {
  await expect(
    Actions.l1.getGame(client, {
      l2BlockNumber: 99_999_999_999_999_999_999n,
      limit: 3,
      targetChain: optimism,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Game.NotFoundError: Dispute game not found.

    Version: viem@2.52.1]
  `)
})
