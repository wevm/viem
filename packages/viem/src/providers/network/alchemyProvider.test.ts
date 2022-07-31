import { expect, test } from 'vitest'

import { mainnet, polygon } from '../../chains'
import { alchemyProvider } from './alchemyProvider'

test('creates', async () => {
  const provider = alchemyProvider({
    chain: mainnet,
  })

  expect(Object.entries(provider)).toMatchInlineSnapshot(`
    [
      [
        "request",
        [Function],
      ],
      [
        "type",
        "networkProvider",
      ],
    ]
  `)
})

test('creates lazily', async () => {
  const provider = alchemyProvider({
    chain: mainnet,
  })

  expect(provider(polygon)).toMatchInlineSnapshot(`
    {
      "request": [Function],
      "type": "networkProvider",
    }
  `)
})

test('request', async () => {
  const provider = alchemyProvider({
    chain: mainnet,
  })

  expect(await provider.request({ method: 'eth_blockNumber' })).toBeDefined()
})
