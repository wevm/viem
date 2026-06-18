import type * as RpcResponse from 'ox/RpcResponse'
import { expectTypeOf, test } from 'vitest'

import { http } from './RpcClient.js'

const client = http('https://example.com')

test('single body: result typed from its method', async () => {
  const response = await client.request({ body: { method: 'eth_chainId' } })
  expectTypeOf(response.result).toEqualTypeOf<`0x${string}` | undefined>()
})

test('single body: non-schema method falls back to unknown', async () => {
  const response = await client.request({ body: { method: 'foo_bar' } })
  expectTypeOf(response.result).toEqualTypeOf<unknown>()
})

test('batch body: maps element-wise to a typed tuple', async () => {
  const responses = await client.request({
    body: [{ method: 'eth_chainId' }, { method: 'eth_blockNumber' }],
  })
  expectTypeOf(responses).toEqualTypeOf<
    [
      RpcResponse.RpcResponse<`0x${string}`>,
      RpcResponse.RpcResponse<`0x${string}`>,
    ]
  >()
})

test('batch body: mixes schema and non-schema methods per element', async () => {
  const responses = await client.request({
    body: [{ method: 'eth_chainId' }, { method: 'foo_bar' }],
  })
  expectTypeOf(responses[0].result).toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf(responses[1].result).toEqualTypeOf<unknown>()
})
