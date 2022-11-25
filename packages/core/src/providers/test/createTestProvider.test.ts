import { expect, test } from 'vitest'

import { local } from '../../chains'

import { createTestProvider } from './createTestProvider'

test('creates', () => {
  const { uid, ...provider } = createTestProvider({
    chain: local,
    key: 'anvil',
    name: 'Anvil',
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
          "local": "http://127.0.0.1:8545",
        },
      },
      "key": "anvil",
      "name": "Anvil",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "testProvider",
    }
  `)
})

test('creates with custom url', () => {
  const { uid, ...provider } = createTestProvider({
    chain: local,
    key: 'anvil',
    name: 'Anvil',
    url: 'http://localhost:1337',
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
          "local": "http://localhost:1337",
        },
      },
      "key": "anvil",
      "name": "Anvil",
      "pollingInterval": 4000,
      "request": [Function],
      "type": "testProvider",
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
