import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { requestAddresses } from './requestAddresses.js'

const client = anvilMainnet.getClient()

test('requests accounts', async () => {
  expect(await requestAddresses(client!)).toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
