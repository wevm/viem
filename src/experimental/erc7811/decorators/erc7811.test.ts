import { expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { erc7811Actions } from './erc7811.js'

const client = anvilMainnet.getClient().extend(erc7811Actions())

test('default', async () => {
  expect(erc7811Actions()(client)).toMatchInlineSnapshot(`
    {
      "getAssets": [Function],
    }
  `)
})
