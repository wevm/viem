import { expect, test } from 'vitest'

import { local } from '../../chains'

import { createTestProvider } from './createTestProvider'

test('creates', () => {
  const provider = createTestProvider({
    chain: local,
    id: 'anvil',
    name: 'Anvil',
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
        "id": 1337,
        "name": "Localhost",
        "network": "localhost",
        "rpcUrls": {
          "default": "http://127.0.0.1:8545",
          "local": "http://127.0.0.1:8545",
        },
      },
      "chains": [
        {
          "id": 1337,
          "name": "Localhost",
          "network": "localhost",
          "rpcUrls": {
            "default": "http://127.0.0.1:8545",
            "local": "http://127.0.0.1:8545",
          },
        },
      ],
      "id": "anvil",
      "name": "Anvil",
      "request": [Function],
      "type": "testProvider",
    }
  `)
})

test('creates with custom url', () => {
  const provider = createTestProvider({
    chain: local,
    id: 'anvil',
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
          "default": "http://127.0.0.1:8545",
          "local": "http://localhost:1337",
        },
      },
      "chains": [
        {
          "id": 1337,
          "name": "Localhost",
          "network": "localhost",
          "rpcUrls": {
            "default": "http://127.0.0.1:8545",
            "local": "http://localhost:1337",
          },
        },
      ],
      "id": "anvil",
      "name": "Anvil",
      "request": [Function],
      "type": "testProvider",
    }
  `)
})

test('errors if no url found', () => {
  expect(() =>
    createTestProvider({
      chain: { ...local, rpcUrls: { default: '' } },
      id: 'anvil',
      name: 'Anvil',
    }),
  ).toThrowError('url is required')
})
