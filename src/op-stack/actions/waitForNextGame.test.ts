import { beforeAll, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getGames } from './getGames.js'
import { waitForNextGame } from './waitForNextGame.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 21911472n,
  })
})

test('default', async () => {
  const games = await getGames(client, {
    limit: 10,
    targetChain: optimism,
  })
  const [defaultGame] = games
  const game = await waitForNextGame(client, {
    limit: 10,
    l2BlockNumber: defaultGame.l2BlockNumber - 10n,
    targetChain: optimism,
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
}, 20_000)
