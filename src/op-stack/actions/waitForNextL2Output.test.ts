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
      "l2BlockNumber": 121314196n,
      "outputIndex": 60n,
      "outputRoot": "0xdc4f6418df103a56e75f76b45ff2b5be65485d374d901c2de6e03211ef87bee1",
      "timestamp": 1718228819n,
    }
  `)
}, 20_000)
