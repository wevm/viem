import { expect, test } from 'vitest'
import { mainnetClient } from '../../../test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { waitForNextL2Output } from './waitForNextL2Output.js'

test('default', async () => {
  const output = await waitForNextL2Output(mainnetClient, {
    l2BlockNumber: 19494651n,
    targetChain: optimism,
  })
  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 121227899n,
      "outputIndex": 11n,
      "outputRoot": "0x26e8d8d492f07c9f9d26d81f69fe7f0583d2f9c6ee7964cb76f5caf5a82f06c0",
      "timestamp": 1718056019n,
    }
  `)
}, 20_000)
