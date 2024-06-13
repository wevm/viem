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
      "l2BlockNumber": 121317926n,
      "outputIndex": 62n,
      "outputRoot": "0x584c779fd3fda51ea72aa33725cbd18ff7e7071020108193cee79b7ecf9b0efc",
      "timestamp": 1718236031n,
    }
  `)
}, 20_000)
