import { expect, test } from 'vitest'

import { walletClient } from '../../_test/index.js'

import { getPermissions } from './getPermissions.js'

test('default', async () => {
  expect(await getPermissions(walletClient!)).toMatchInlineSnapshot(`
    [
      {
        "caveats": [
          {
            "type": "filterResponse",
            "value": [
              "0x0c54fccd2e384b4bb6f2e405bf5cbc15a017aafb",
            ],
          },
        ],
        "invoker": "https://example.com",
        "parentCapability": "eth_accounts",
      },
    ]
  `)
})
