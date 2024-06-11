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
      "l2BlockNumber": 121269271n,
      "outputIndex": 34n,
      "outputRoot": "0xaeeedab937234cf92e8c968c5ec98544df05061ebecc1f61e81516e682abb63a",
      "timestamp": 1718138819n,
    }
  `)
}, 20_000)
