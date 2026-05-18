import { beforeAll, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getGame } from './getGame.js'

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
})
