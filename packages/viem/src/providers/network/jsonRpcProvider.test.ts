import { expect, test } from 'vitest'

import * as chains from '../../chains'
import { jsonRpcProvider } from './jsonRpcProvider'

test('creates', async () => {
  const provider = jsonRpcProvider({
    chain: chains.local,
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "chain": {
        "id": 1337,
        "name": "Localhost",
        "network": "localhost",
        "rpcUrls": {
          "public": "http://127.0.0.1:8545",
        },
      },
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
      "id": "jsonRpc",
      "name": "JSON-RPC",
      "request": [Function],
      "type": "networkProvider",
    }
  `)
})

Object.keys(chains).forEach((key) => {
  if (key === 'local') return

  // eslint-disable-next-line import/namespace
  const chain = chains[key]
  test(`request (${key})`, async () => {
    const provider = jsonRpcProvider({
      chain,
      url: chain.rpcUrls.public,
    })

    expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
  })
})

test('request (local)', async () => {
  const provider = jsonRpcProvider({
    chain: chains.local,
    id: 'jsonRpc',
    name: 'JSON RPC',
  })

  expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
})
