// TODO(v3): Remove this.

import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { erc7895Actions } from './erc7895.js'

const client = anvilMainnet.getClient().extend(erc7895Actions())

test('default', async () => {
  expect(erc7895Actions()(client)).toMatchInlineSnapshot(`
    {
      "addSubAccount": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('addSubAccount', async () => {
    expect(
      await client.addSubAccount({
        keys: [
          {
            publicKey: '0x0000000000000000000000000000000000000000',
            type: 'address',
          },
        ],
        type: 'create',
      }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      }
    `)
  })
})
