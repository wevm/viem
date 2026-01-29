import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getL2Output } from './getL2Output.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  await reset(client, {
    blockNumber: 21911472n,
  })
  const game = await getL2Output(client, {
    targetChain: optimism,
    l2BlockNumber: 132300000n,
    limit: 10,
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('outputIndex')
  expect(game).toHaveProperty('outputRoot')
  expect(game).toHaveProperty('timestamp')
})
