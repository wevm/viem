import { describe, expect, test } from 'vitest'

import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { walletActionsErc7115 } from './erc7115.js'

const client = createClient({
  transport: custom({
    async request({ method, params }) {
      if (method === 'wallet_issuePermissions')
        return {
          grantedPermissions: params[0].permissions.map((permission: any) => ({
            type: permission.type,
            data: permission.data,
          })),
          expiry: params[0].expiry,
          permissionsContext: '0xdeadbeef',
        }

      return null
    },
  }),
}).extend(walletActionsErc7115())

test('default', async () => {
  expect(walletActionsErc7115()(client)).toMatchInlineSnapshot(`
    {
      "issuePermissions": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('issuePermissions', async () => {
    expect(
      await client.issuePermissions({
        expiry: 1716846083638,
        signer: {
          type: 'account',
          data: {
            id: '0x0000000000000000000000000000000000000000',
          },
        },
        permissions: [
          {
            type: 'contract-call',
            data: {
              address: '0x0000000000000000000000000000000000000000',
            },
          },
          {
            type: 'native-token-limit',
            data: {
              amount: 69420n,
            },
            required: true,
          },
        ],
      }),
    ).toMatchInlineSnapshot(`
      {
        "expiry": 1716846083638,
        "grantedPermissions": [
          {
            "data": {
              "address": "0x0000000000000000000000000000000000000000",
            },
            "type": "contract-call",
          },
          {
            "data": {
              "amount": 69420n,
            },
            "type": "native-token-limit",
          },
        ],
        "permissionsContext": "0xdeadbeef",
      }
    `)
  })
})
