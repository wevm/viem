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
})

test('returns recent dispute games', async () => {
  const games = await Actions.l1.getGames(client, {
    limit: 3,
    targetChain: optimism,
  })
  expect(games).toMatchInlineSnapshot(`
    [
      {
        "extraData": "0x0000000000000000000000000000000000000000000000000000000008a46675",
        "index": 13219n,
        "l2BlockNumber": 144991861n,
        "metadata": "0x0000000000000000693cab5f2f32c96920163131333ed15bc523cd7438759c56",
        "rootClaim": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
        "timestamp": 1765583711n,
        "usesSuperRoots": false,
      },
      {
        "extraData": "0x0000000000000000000000000000000000000000000000000000000008a45fb6",
        "index": 13218n,
        "l2BlockNumber": 144990134n,
        "metadata": "0x0000000000000000693c9d379fd43643f5bb8e8072fae192371fb90103795bd5",
        "rootClaim": "0x373998e39ab3a2ed6468b8a71384f74663408a833d4cd33e38255b9dbe90e3a2",
        "timestamp": 1765580087n,
        "usesSuperRoots": false,
      },
      {
        "extraData": "0x0000000000000000000000000000000000000000000000000000000008a45865",
        "index": 13217n,
        "l2BlockNumber": 144988261n,
        "metadata": "0x0000000000000000693c8f0f67318ca7d5e32f5491dcb088ca253771e4f509cd",
        "rootClaim": "0x8c44cbe9e1d223f7308d82743636c4f0329a88a0344982e45a70bbbcf16fdca7",
        "timestamp": 1765576463n,
        "usesSuperRoots": false,
      },
    ]
  `)
})

test('estimates the next game from observed intervals', async () => {
  const games = await Actions.l1.getGames(client, {
    limit: 10,
    targetChain: optimism,
  })
  const game = games[0]!
  const result = await Actions.l1.getTimeToNextGame(client, {
    l2BlockNumber: game.l2BlockNumber + 1n,
    targetChain: optimism,
  })
  expect({
    interval: result.interval,
    secondsPositive: result.seconds > 0,
    timestampFuture:
      result.timestamp !== undefined && result.timestamp > Date.now(),
  }).toMatchInlineSnapshot(`
    {
      "interval": 3615,
      "secondsPositive": true,
      "timestampFuture": true,
    }
  `)
})

test('filters games by L2 position', async () => {
  const games = await Actions.l1.getGames(client, {
    l2BlockNumber: 99_999_999_999_999_999_999n,
    limit: 3,
    targetChain: optimism,
  })
  expect(games).toMatchInlineSnapshot(`[]`)
})
