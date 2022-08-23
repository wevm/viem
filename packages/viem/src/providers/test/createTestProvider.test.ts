import { expect, test } from 'vitest'

import { local } from '../../chains'

import { createTestProvider } from './createTestProvider'

test('creates', () => {
  const provider = createTestProvider({
    chain: local,
    key: 'anvil',
    name: 'Anvil',
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
          "local": "http://127.0.0.1:8545",
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
            "local": "http://127.0.0.1:8545",
          },
        },
      ],
      "key": "anvil",
      "name": "Anvil",
      "request": [Function],
      "type": "testProvider",
      "uniqueId": "anvil.1337",
    }
  `)
})

test('creates with custom url', () => {
  const provider = createTestProvider({
    chain: local,
    key: 'anvil',
    name: 'Anvil',
    url: 'http://localhost:1337',
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
          "local": "http://localhost:1337",
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
            "local": "http://localhost:1337",
          },
        },
      ],
      "key": "anvil",
      "name": "Anvil",
      "request": [Function],
      "type": "testProvider",
      "uniqueId": "anvil.1337",
    }
  `)
})

test('errors if no url found', () => {
  expect(() =>
    createTestProvider({
      chain: { ...local, rpcUrls: { default: { http: '' } } },
      key: 'anvil',
      name: 'Anvil',
    }),
  ).toThrowError('url is required')
})
