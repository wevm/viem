// TODO(v3): Remove this.

import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { erc7846Actions } from './erc7846.js'

const client = anvilMainnet.getClient().extend(erc7846Actions())

test('default', async () => {
  expect(erc7846Actions()(client)).toMatchInlineSnapshot(`
    {
      "connect": [Function],
      "disconnect": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('connect', async () => {
    expect(await client.connect()).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "capabilities": {},
          },
        ],
      }
    `)
  })

  test('disconnect', async () => {
    await client.disconnect()
  })
})
