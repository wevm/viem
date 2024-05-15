import { expect, test } from 'vitest'
import { anvilSepolia } from '../../../test/src/anvil.js'
import { optimismSepolia } from '../../op-stack/chains.js'
import { getGame } from './getGame.js'

const sepoliaClient = anvilSepolia.getClient()

// TODO(fault-proofs): use anvil client when fault proofs deployed to mainnet.
test('default', async () => {
  const game = await getGame(sepoliaClient, {
    targetChain: optimismSepolia,
    l2BlockNumber: 9510398n,
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
  const game = await getGame(sepoliaClient, {
    targetChain: optimismSepolia,
    l2BlockNumber: 9510398n,
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
  const game = await getGame(sepoliaClient, {
    limit: 10,
    l2BlockNumber: 9510398n,
    disputeGameFactoryAddress: '0x05F9613aDB30026FFd634f38e5C4dFd30a197Fa1',
    portalAddress: '0x16Fc5058F25648194471939df75CF27A2fdC48BC',
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('index')
  expect(game).toHaveProperty('metadata')
  expect(game).toHaveProperty('timestamp')
  expect(game).toHaveProperty('rootClaim')
  expect(game).toHaveProperty('extraData')
})
