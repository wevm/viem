import { expect, test } from 'vitest'

import { local } from '../chains'

import { rpc } from './rpc'

test('valid request', async () => {
  expect(
    await rpc.http(local.rpcUrls.default, {
      body: { method: 'web3_clientVersion' },
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 0,
      "jsonrpc": "2.0",
      "result": "anvil/v0.1.0",
    }
  `)
})

test('valid request w/ incremented id', async () => {
  expect(
    await rpc.http(local.rpcUrls.default, {
      body: { method: 'web3_clientVersion' },
    }),
  ).toMatchInlineSnapshot(`
    {
      "id": 1,
      "jsonrpc": "2.0",
      "result": "anvil/v0.1.0",
    }
  `)
})

test('invalid request', async () => {
  expect(
    rpc.http(local.rpcUrls.default, {
      body: { method: 'eth_wagmi' },
    }),
  ).rejects.toThrowError()
})
