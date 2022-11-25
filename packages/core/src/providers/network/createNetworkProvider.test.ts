import { expect, test } from 'vitest'

import { local } from '../../chains'

import { createNetworkProvider } from './createNetworkProvider'

test('creates', () => {
  const { uid, ...provider } = createNetworkProvider({
    chain: local,
    key: 'network',
    name: 'Network',
    request: <any>(async () => null),
    transportMode: 'http',
  })

  expect(uid).toBeDefined()
  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
        "blockTime": 1000,
        "id": 1337,
        "name": "Localhost",
        "network": "localhost",
        "rpcUrls": {
          "default": {
            "http": "http://127.0.0.1:8545",
            "webSocket": "ws://127.0.0.1:8545",
          },
          "local": {
            "http": "http://127.0.0.1:8545",
            "webSocket": "ws://127.0.0.1:8545",
          },
        },
      },
      "key": "network",
      "name": "Network",
      "pollingInterval": 4000,
      "request": [Function],
      "transportMode": "http",
      "type": "networkProvider",
    }
  `)
})
