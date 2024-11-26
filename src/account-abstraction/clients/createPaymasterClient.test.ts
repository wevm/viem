import { expect, test } from 'vitest'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import { http } from '../../clients/transports/http.js'
import { createPaymasterClient } from './createPaymasterClient.js'

test('creates', () => {
  const { uid, transport, ...client } = createPaymasterClient({
    transport: http(bundlerMainnet.rpcUrl.http),
  })

  expect(uid).toBeDefined()
  expect(transport).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "batch": undefined,
      "cacheTime": 4000,
      "ccipRead": undefined,
      "chain": undefined,
      "extend": [Function],
      "getPaymasterData": [Function],
      "getPaymasterStubData": [Function],
      "key": "bundler",
      "name": "Bundler Client",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "PaymasterClient",
    }
  `)
})
