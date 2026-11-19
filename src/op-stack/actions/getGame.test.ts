import { beforeAll, expect, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getGame } from './getGame.js'
import * as getGamesModule from './getGames.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 21911472n,
  })
})

test('default', async () => {
  const game = await getGame(client, {
    targetChain: optimism,
    l2BlockNumber: 132300000n,
    limit: 10,
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
  expect(game).toHaveProperty('usesSuperRoots', false)
})

test('args: strategy', async () => {
  const game = await getGame(client, {
    targetChain: optimism,
    l2BlockNumber: 132300000n,
    limit: 10,
    strategy: 'random',
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
  expect(game).toHaveProperty('usesSuperRoots', false)
})

test('args: address', async () => {
  const game = await getGame(client, {
    limit: 10,
    l2BlockNumber: 132300000n,
    disputeGameFactoryAddress: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9',
    portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
  expect(game).toHaveProperty('usesSuperRoots', false)
})

test('behavior: returns a game at exactly l2BlockNumber', async () => {
  const spy = vi.spyOn(getGamesModule, 'getGames').mockResolvedValueOnce([
    {
      index: 1n,
      metadata: '0x' as `0x${string}`,
      timestamp: 1n,
      rootClaim:
        '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
      extraData: '0x' as `0x${string}`,
      l2BlockNumber: 1000n,
      usesSuperRoots: false,
    },
  ])
  const game = await getGame(client, {
    targetChain: optimism,
    l2BlockNumber: 1000n,
  })
  expect(game.l2BlockNumber).toBe(1000n)
  expect(game.index).toBe(1n)
  spy.mockRestore()
})
