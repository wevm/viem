import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { requestPermissions } from './requestPermissions.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(
    await requestPermissions(client!, { eth_accounts: {} }),
  ).toMatchInlineSnapshot(`
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
