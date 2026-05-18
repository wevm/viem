import { beforeAll, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getGames } from './getGames.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 21911472n,
  })
})

test('default', async () => {
  const games = await getGames(client, {
    targetChain: optimism,
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
  const games = await getGames(client, {
    targetChain: optimism,
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
  const games = await getGames(client, {
    targetChain: optimism,
    limit: 10,
    l2BlockNumber: 99999999999999999999n,
  })
  expect(games.length).toBe(0)
})

test('args: address', async () => {
  const games = await getGames(client, {
    limit: 10,
    l2BlockNumber: 9510398n,
    disputeGameFactoryAddress: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9',
    portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
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
