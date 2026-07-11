import {
  type Authorization,
  type Hex,
  RpcSchema,
  type StateOverrides,
} from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Client as CoreClient, http } from 'viem'

import { mainnet } from '../chains/definitions/mainnet.js'
import * as Client from './Client.js'
import * as PaymasterClient from './PaymasterClient.js'
import type * as Simple7702SmartAccount from './Simple7702SmartAccount.js'
import type * as UserOperation from './UserOperation.js'
import type * as UserOperationGas from './UserOperationGas.js'
import type { get } from './actions/userOperation/get.js'

declare const account: Simple7702SmartAccount.Account
declare const authorization: Authorization.Rpc
declare const hash: Hex.Hex

const rpcUserOperation = {
  callData: '0x',
  callGasLimit: '0x0',
  eip7702Auth: authorization,
  maxFeePerGas: '0x0',
  maxPriorityFeePerGas: '0x0',
  nonce: '0x0',
  preVerificationGas: '0x0',
  sender: '0x0000000000000000000000000000000000000000',
  signature: '0x',
  verificationGasLimit: '0x0',
} as const

test('create', () => {
  const executionClient = CoreClient.create({
    chain: mainnet,
    transport: http(),
  })
  const client = Client.create({
    account,
    client: executionClient,
    transport: http('https://bundler.example'),
  })

  expectTypeOf(client.account).toEqualTypeOf(account)
  expectTypeOf(client.chain).toEqualTypeOf(mainnet)
  expectTypeOf(client.client).toEqualTypeOf(executionClient)
  expectTypeOf(client.userOperation.get).returns.resolves.toEqualTypeOf<
    get.ReturnType<'0.8'>
  >()
})

test('extend', () => {
  const client = Client.create({ transport: http() })
    .extend(() => ({
      custom: { value: 1 as const },
    }))
    .extend((client) => {
      expectTypeOf(client.custom.value).toEqualTypeOf<1>()
      return { second: { value: 2 as const } }
    })

  expectTypeOf(client.custom.value).toEqualTypeOf<1>()
  expectTypeOf(client.second.value).toEqualTypeOf<2>()
  expectTypeOf(client.entryPoint.getSupported).toBeFunction()
})

test('extend User Operation namespace', () => {
  const client = Client.create({ transport: http() }).extend(() => ({
    userOperation: {
      custom() {
        return 1 as const
      },
    },
  }))

  expectTypeOf(client.userOperation.custom()).toEqualTypeOf<1>()
  expectTypeOf(client.userOperation.prepare).toBeFunction()
})

test('request: EntryPoint 0.8 schema', async () => {
  const client = Client.create({ account, transport: http() })

  const chainId = await client.request({ method: 'eth_chainId' })
  expectTypeOf(chainId).toEqualTypeOf<Hex.Hex>()

  const entryPoints = await client.request({
    method: 'eth_supportedEntryPoints',
  })
  expectTypeOf(entryPoints).toEqualTypeOf<readonly Hex.Hex[]>()

  const estimate = await client.request({
    method: 'eth_estimateUserOperationGas',
    params: [rpcUserOperation, account.entryPoint.address],
  })
  expectTypeOf(estimate).toEqualTypeOf<UserOperationGas.Rpc<'0.8'>>()

  const estimateWithOverrides = await client.request({
    method: 'eth_estimateUserOperationGas',
    params: [
      rpcUserOperation,
      account.entryPoint.address,
      {} satisfies StateOverrides.Rpc,
    ],
  })
  expectTypeOf(estimateWithOverrides).toEqualTypeOf<
    UserOperationGas.Rpc<'0.8'>
  >()

  const sent = await client.request({
    method: 'eth_sendUserOperation',
    params: [rpcUserOperation, account.entryPoint.address],
  })
  expectTypeOf(sent).toEqualTypeOf<Hex.Hex>()

  client.request({
    method: 'eth_sendUserOperation',
    params: [
      {
        ...rpcUserOperation,
        // @ts-expect-error Bundlers name the wire field `eip7702Auth`.
        authorization,
      },
      account.entryPoint.address,
    ],
  })

  const result = await client.request({
    method: 'eth_getUserOperationByHash',
    params: [hash],
  })
  expectTypeOf(
    result,
  ).toEqualTypeOf<UserOperation.RpcTransactionInfo<'0.8'> | null>()
})

test('request: custom Ox schema preserves the Bundler schema', async () => {
  const schema = RpcSchema.from<{
    Request: { method: 'eth_wagmi'; params: [value: string] }
    ReturnType: string
  }>()
  const client = Client.create({ account, schema, transport: http() })

  const custom = await client.request({
    method: 'eth_wagmi',
    params: ['hello'],
  })
  expectTypeOf(custom).toEqualTypeOf<string>()

  const chainId = await client.request({ method: 'eth_chainId' })
  expectTypeOf(chainId).toEqualTypeOf<Hex.Hex>()
})

test('paymaster configuration', () => {
  const paymaster = PaymasterClient.create({ transport: http() })

  Client.create({ paymaster, transport: http() })
  Client.create({
    paymaster: {
      getData: paymaster.paymaster.getData,
      getStubData: paymaster.paymaster.getStubData,
    },
    transport: http(),
  })
  Client.create({ paymaster: true, transport: http() })
})
