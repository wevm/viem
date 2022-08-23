import { expect, test } from 'vitest'

import { local } from '../chains'

import { createBaseProvider } from './createBaseProvider'

test('creates', () => {
  const provider = createBaseProvider({
    chains: [local],
    key: 'base',
    name: 'Base',
    request: <any>(async () => null),
    type: 'baseProvider',
    uniqueId: 'base',
  })

  expect(provider).toMatchInlineSnapshot(`
    {
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
      "key": "base",
      "name": "Base",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "baseProvider",
      "uniqueId": "base",
    }
  `)
})
