import { expect, test } from 'vitest'
import { anvilSepolia } from '../../../test/src/anvil.js'
import { optimismSepolia } from '../../op-stack/chains.js'
import { getGames } from './getGames.js'

const sepoliaClient = anvilSepolia.getClient()

// TODO(fault-proofs): use anvil client when fault proofs deployed to mainnet.
test('default', async () => {
  const games = await getGames(sepoliaClient, {
    targetChain: optimismSepolia,
    limit: 10,
  })
  expect(games.length > 0).toBeTruthy()

  const [game] = games
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
})

test('args: l2BlockNumber', async () => {
  const games = await getGames(sepoliaClient, {
    targetChain: optimismSepolia,
    limit: 10,
    l2BlockNumber: 9510398n,
  })
  expect(games.length > 0).toBeTruthy()

  const [game] = games
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
})

test('args: l2BlockNumber (high)', async () => {
  const games = await getGames(sepoliaClient, {
    targetChain: optimismSepolia,
    limit: 10,
    l2BlockNumber: 99999999999999999999n,
  })
  expect(games.length).toBe(0)
})

test('args: address', async () => {
  const games = await getGames(sepoliaClient, {
    limit: 10,
    l2BlockNumber: 9510398n,
    disputeGameFactoryAddress: '0x05F9613aDB30026FFd634f38e5C4dFd30a197Fa1',
    portalAddress: '0x16Fc5058F25648194471939df75CF27A2fdC48BC',
  })
  expect(games.length > 0).toBeTruthy()

  const [game] = games
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
})
