import { expect, test, vi } from 'vitest'
import { anvilSepolia } from '../../../test/src/anvil.js'
import { optimismSepolia } from '../../op-stack/chains.js'
import { getGames } from './getGames.js'
import { getTimeToNextGame } from './getTimeToNextGame.js'

const sepoliaClient = anvilSepolia.getClient()

const games = await getGames(sepoliaClient, {
  limit: 10,
  targetChain: optimismSepolia,
})
const [game] = games
const l2BlockNumber = game.l2BlockNumber

// TODO(fault-proofs): use anvil client when fault proofs deployed to mainnet.
test('default', async () => {
  const { interval, seconds, timestamp } = await getTimeToNextGame(
    sepoliaClient,
    {
      l2BlockNumber: l2BlockNumber + 1n,
      targetChain: optimismSepolia,
    },
  )
  expect(interval).toBeDefined()
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('Date.now < latestOutputTimestamp', async () => {
  vi.setSystemTime(new Date(1702399191000))
  const { seconds, timestamp } = await getTimeToNextGame(sepoliaClient, {
    l2BlockNumber: l2BlockNumber + 1n,
    targetChain: optimismSepolia,
  })
  vi.useRealTimers()
  expect(seconds).toBe(0)
  expect(timestamp).toBe(undefined)
})

test('elapsedBlocks > blockInterval', async () => {
  const { interval, seconds, timestamp } = await getTimeToNextGame(
    sepoliaClient,
    {
      l2BlockNumber: l2BlockNumber + 1000n,
      targetChain: optimismSepolia,
    },
  )
  expect(interval).toBeDefined()
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('l2BlockNumber < latestGame.blockNumber', async () => {
  const { seconds, timestamp } = await getTimeToNextGame(sepoliaClient, {
    l2BlockNumber: l2BlockNumber - 10n,
    targetChain: optimismSepolia,
  })
  expect(seconds).toBe(0)
  expect(timestamp).toBe(undefined)
})
