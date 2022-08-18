import { expect, test } from 'vitest'

import { local } from '../../chains'

import { createNetworkProvider } from './createNetworkProvider'

test('creates', () => {
  const provider = createNetworkProvider({
    chain: local,
    id: 'network',
    name: 'Network',
    request: <any>(async () => null),
    transportMode: 'http',
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
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
      "chains": [
        {
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
      ],
      "id": "network",
      "name": "Network",
      "request": [Function],
      "transportMode": "http",
      "type": "networkProvider",
    }
  `)
})
