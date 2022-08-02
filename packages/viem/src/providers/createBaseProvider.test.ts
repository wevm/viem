import { expect, test } from 'vitest'

import { local } from '../chains'

import { createBaseProvider } from './createBaseProvider'

test('creates', () => {
  const provider = createBaseProvider({
    chains: [local],
    id: 'base',
    name: 'Base',
    request: <any>(async () => null),
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chains": [
        {
          "id": 1337,
          "name": "Localhost",
          "network": "localhost",
          "rpcUrls": {
            "public": "http://127.0.0.1:8545",
          },
        },
      ],
      "id": "base",
      "name": "Base",
      "request": [Function],
    }
  `)
})
