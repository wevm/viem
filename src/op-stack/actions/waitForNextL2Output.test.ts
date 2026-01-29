import { expect, test } from 'vitest'
import { mainnetClient } from '../../../test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { waitForNextL2Output } from './waitForNextL2Output.js'

test('default', async () => {
  const output = await waitForNextL2Output(mainnetClient, {
    l2BlockNumber: 19494651n,
    targetChain: optimism,
  })
  expect(output).toBeDefined()
}, 20_000)
