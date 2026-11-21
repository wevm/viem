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
  expect(game).toHaveProperty('usesSuperRoots', false)
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
  expect(game).toHaveProperty('usesSuperRoots', false)
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
  expect(game).toHaveProperty('usesSuperRoots', false)
})

test('behavior: reads disputeGameFactory from the portal', async () => {
  await reset(client, {
    blockNumber: 26430000n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  const expected = await getGames(client, {
    limit: 10,
    disputeGameFactoryAddress: '0xe5965Ab5962eDc7477C8520243A95517CD252fA9',
    portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
  })
  expect(expected.length > 0).toBeTruthy()

  // `getWithdrawalStatus` and friends accept chains with only `l2OutputOracle`.
  const withoutFactory = {
    ...optimism,
    contracts: { portal: optimism.contracts.portal },
  } as unknown as typeof optimism
  expect(
    await getGames(client, { targetChain: withoutFactory, limit: 10 }),
  ).toEqual(expected)

  // A chain definition can hold a factory the portal no longer uses, such as
  // after a chain moves to a shared factory. Unichain's factory stands in here.
  const staleFactory = {
    ...optimism,
    contracts: {
      ...optimism.contracts,
      disputeGameFactory: {
        1: { address: '0x2F12d621a16e2d3285929C9996f478508951dFe4' },
      },
    },
  } as const
  expect(
    await getGames(client, { targetChain: staleFactory, limit: 10 }),
  ).toEqual(expected)
})
