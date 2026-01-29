import { beforeAll, expect, test, vi } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getGames } from './getGames.js'
import { getTimeToNextGame } from './getTimeToNextGame.js'

const client = anvilMainnet.getClient()

let l2BlockNumber: bigint
beforeAll(async () => {
  await reset(client, {
    blockNumber: 21911472n,
  })
  const games = await getGames(client, {
    limit: 10,
    targetChain: optimism,
  })
  const [game] = games
  l2BlockNumber = game.l2BlockNumber
})

test('default', async () => {
  const { interval, seconds, timestamp } = await getTimeToNextGame(client, {
    l2BlockNumber: l2BlockNumber + 1n,
    targetChain: optimism,
  })
  expect(interval).toBeDefined()
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('Date.now < latestOutputTimestamp', async () => {
  vi.setSystemTime(new Date(1702399191000))
  const { seconds, timestamp } = await getTimeToNextGame(client, {
    l2BlockNumber: l2BlockNumber + 1n,
    targetChain: optimism,
  })
  vi.useRealTimers()
  expect(seconds).toBe(0)
  expect(timestamp).toBe(undefined)
})

test('elapsedBlocks > blockInterval', async () => {
  const { interval, seconds, timestamp } = await getTimeToNextGame(client, {
    l2BlockNumber: l2BlockNumber + 1000n,
    targetChain: optimism,
  })
  expect(interval).toBeDefined()
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('l2BlockNumber < latestGame.blockNumber', async () => {
  const { seconds, timestamp } = await getTimeToNextGame(client, {
    l2BlockNumber: l2BlockNumber - 10n,
    targetChain: optimism,
  })
  expect(seconds).toBe(0)
  expect(timestamp).toBe(undefined)
})
