import { expect, test } from 'vitest'

import { base } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { getProof } from './getProof.js'

test('default', async () => {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  })

  const result = await getProof(client, {
    address: '0x4200000000000000000000000000000000000016',
    storageKeys: [
      '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
    ],
  })

  expect(Object.keys(result)).toMatchInlineSnapshot(`
    [
      "accountProof",
      "address",
      "balance",
      "codeHash",
      "nonce",
      "storageHash",
      "storageProof",
    ]
  `)
})
