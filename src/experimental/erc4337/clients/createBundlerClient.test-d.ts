import { expectTypeOf, test } from 'vitest'
import { localhost } from '../../../chains/index.js'
import { rpcSchema } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import type { RpcUserOperationReceipt } from '../types/rpc.js'
import {
  type BundlerClient,
  createBundlerClient,
} from './createBundlerClient.js'

test('with chain', () => {
  const client = createBundlerClient({
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<BundlerClient>()
  expectTypeOf(client.chain).toEqualTypeOf(localhost)
})

test('without chain', () => {
  const client = createBundlerClient({ transport: http() })
  expectTypeOf(client).toMatchTypeOf<BundlerClient>()
  expectTypeOf(client.chain).toEqualTypeOf(undefined)
})

test('rpc schema', async () => {
  const client = createBundlerClient({
    transport: http(),
  })

  const result = await client.request({
    method: 'eth_getUserOperationReceipt',
    params: ['0x'],
  })
  expectTypeOf(result).toEqualTypeOf<RpcUserOperationReceipt | null>()
})

test('with custom rpc schema', async () => {
  type MockRpcSchema = [
    {
      Method: 'eth_wagmi'
      Parameters: [string]
      ReturnType: string
    },
  ]

  const client = createBundlerClient({
    rpcSchema: rpcSchema<MockRpcSchema>(),
    transport: http(),
  })

  expectTypeOf(client).toMatchTypeOf<BundlerClient>()

  const result = await client.request({
    method: 'eth_wagmi',
    params: ['hello'],
  })
  expectTypeOf(result).toEqualTypeOf<string>()
})
