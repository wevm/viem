import { expect, test } from 'vitest'

import { local } from '../chains'

import { request } from './request'

test('valid request', async () => {
  expect(
    await request(local.rpcUrls.default, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'web3_clientVersion',
        params: [],
      }),
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 0,
      "jsonrpc": "2.0",
      "result": "anvil/v0.1.0",
    }
  `)
})

test('invalid request', async () => {
  try {
    await request(local.rpcUrls.default, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'wagmi',
        params: [],
      }),
    })
  } catch (err) {
    expect(err).toBeDefined()
  }
})
