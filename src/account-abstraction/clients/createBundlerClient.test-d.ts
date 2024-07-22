import { expectTypeOf, test } from 'vitest'
import { getSmartAccounts_07 } from '../../../test/src/account-abstraction.js'
import { localhost } from '../../chains/index.js'
import { createClient, rpcSchema } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import type { SmartAccount } from '../accounts/types.js'
import type { RpcUserOperationReceipt } from '../types/rpc.js'
import {
  type BundlerClient,
  createBundlerClient,
} from './createBundlerClient.js'

const [account] = await getSmartAccounts_07()

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

test('with account', async () => {
  const client = createBundlerClient({
    account,
    chain: localhost,
    transport: http(),
  })
  expectTypeOf(client).toMatchTypeOf<BundlerClient>()
  expectTypeOf(client.account).toMatchTypeOf<SmartAccount>()
  expectTypeOf(client.account).toMatchTypeOf<
    SmartAccount<
      typeof client.account.entryPoint.abi,
      typeof client.account.entryPoint.version
    >
  >()
})

test('without account', () => {
  const client = createBundlerClient({ transport: http() })
  expectTypeOf(client).toMatchTypeOf<BundlerClient>()
  expectTypeOf(client.account).toEqualTypeOf(undefined)
})

test('with client', () => {
  const client = createClient({
    chain: localhost,
    transport: http(),
  })
  const bundlerClient = createBundlerClient({
    client,
    transport: http(),
  })

  expectTypeOf(bundlerClient.chain).toEqualTypeOf(localhost)
  expectTypeOf(bundlerClient.client).toEqualTypeOf(client)
})

test('action: estimateUserOperationGas', () => {
  const client_withAccount = createBundlerClient({
    account,
    transport: http(),
  })
  client_withAccount.estimateUserOperationGas({
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
  })

  const client_withoutAccount = createBundlerClient({
    transport: http(),
  })
  // @ts-expect-error
  client_withoutAccount.estimateUserOperationGas({
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
  })
})

test('action: prepareUserOperation', () => {
  const client_withAccount = createBundlerClient({
    account,
    transport: http(),
  })
  client_withAccount.prepareUserOperation({
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
  })

  const client_withoutAccount = createBundlerClient({
    transport: http(),
  })
  // @ts-expect-error
  client_withoutAccount.prepareUserOperation({
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
  })
})

test('action: sendUserOperation', () => {
  const client_withAccount = createBundlerClient({
    account,
    transport: http(),
  })
  client_withAccount.sendUserOperation({
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
  })

  const client_withoutAccount = createBundlerClient({
    transport: http(),
  })
  // @ts-expect-error
  client_withoutAccount.sendUserOperation({
    calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
  })
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
