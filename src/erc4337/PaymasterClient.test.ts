import { expect, test } from 'vitest'

import { http } from 'viem'
import * as PaymasterClient from './PaymasterClient.js'

test('default', () => {
  const client = PaymasterClient.create({
    pollingInterval: 10,
    transport: http('https://paymaster.example'),
  })

  expect({
    ...client,
    extend: null,
    request: null,
    transport: null,
    uid: null,
  }).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "batch": undefined,
      "cacheTime": 10,
      "ccipRead": undefined,
      "chain": undefined,
      "dataSuffix": undefined,
      "extend": null,
      "key": "paymaster",
      "name": "Paymaster Client",
      "paymaster": {
        "getData": [Function],
        "getStubData": [Function],
      },
      "pollingInterval": 10,
      "request": null,
      "tokens": undefined,
      "transport": null,
      "type": "paymaster",
      "uid": null,
    }
  `)
})
