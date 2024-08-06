import { describe, expect, test } from 'vitest'

import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { erc7715Actions } from './erc7715.js'

const client = createClient({
  transport: custom({
    async request({ method, params }) {
      if (method === 'wallet_grantPermissions')
        return {
          grantedPermissions: params[0].permissions,
          expiry: params[0].expiry,
          permissionsContext: '0xdeadbeef',
        }

      return null
    },
  }),
}).extend(erc7715Actions())

test('default', async () => {
  expect(erc7715Actions()(client)).toMatchInlineSnapshot(`
    {
      "grantPermissions": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('grantPermissions', async () => {
    expect(
      await client.grantPermissions({
        expiry: 1716846083638,
        signer: {
          type: 'account',
          data: {
            id: '0x0000000000000000000000000000000000000000',
          },
        },
        permissions: [
          {
            type: 'native-token-transfer',
            data: {
              ticker: 'ETH',
            },
            policies: [
              {
                type: 'token-allowance',
                data: {
                  allowance: 1n,
                },
              },
            ],
          },
        ],
      }),
    ).toMatchInlineSnapshot(`
      {
        "expiry": 1716846083638,
        "grantedPermissions": [
          {
            "data": {
              "ticker": "ETH",
            },
            "policies": [
              {
                "data": {
                  "allowance": 1n,
                },
                "type": "token-allowance",
              },
            ],
            "required": false,
            "type": "native-token-transfer",
          },
        ],
        "permissionsContext": "0xdeadbeef",
      }
    `)
  })
})
