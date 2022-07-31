import { expect, test } from 'vitest'

import { local } from '../../chains'
import { jsonRpcProvider } from './jsonRpcProvider'

test('creates', async () => {
  const provider = jsonRpcProvider({
    url: local.rpcUrls.public,
  })

  expect(provider).toMatchInlineSnapshot(`
    {
      "request": [Function],
      "type": "networkProvider",
    }
  `)
})

test('request', async () => {
  const provider = jsonRpcProvider({
    url: local.rpcUrls.public,
  })

  expect(
    await provider.request({ method: 'eth_blockNumber' }),
  ).toMatchInlineSnapshot('"0xe6e560"')
})
