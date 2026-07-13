import type { Address, Kzg, TransactionRequest } from 'ox'
import { expectTypeOf, test } from 'vitest'

import {
  Account,
  Chain,
  Client,
  http,
  NonceManager,
  publicActions,
  walletActions,
} from 'viem'
import { mainnet } from 'viem/chains'

import { prepare } from './prepare.js'

const client = Client.create({ chain: mainnet, transport: http() })

test('default: fills chainId, nonce, gas, type, and fees', async () => {
  const { capabilities, request } = await prepare(client, {
    account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1n,
  })

  expectTypeOf(capabilities).extract<undefined>().toEqualTypeOf<undefined>()
  expectTypeOf(request.chainId).toEqualTypeOf<number>()
  expectTypeOf(request.nonce).toEqualTypeOf<number>()
  expectTypeOf(request.gas).toEqualTypeOf<bigint>()
  expectTypeOf(request.maxFeePerGas).toEqualTypeOf<bigint>()
  expectTypeOf(request.maxPriorityFeePerGas).toEqualTypeOf<bigint>()
})

test('args: type (legacy) narrows fee fields', async () => {
  const { request } = await prepare(client, {
    account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    type: 'legacy',
    value: 1n,
  })

  expectTypeOf(request.type).toEqualTypeOf<'legacy'>()
  expectTypeOf(request.gasPrice).toEqualTypeOf<bigint>()
  expectTypeOf(request.maxFeePerGas).toEqualTypeOf<undefined>()
  expectTypeOf(request.maxPriorityFeePerGas).toEqualTypeOf<undefined>()
})

test('behavior: account hoisting adds account + from', async () => {
  const hoisted = Client.create({
    account: Account.fromPrivateKey('0x'),
    chain: mainnet,
    transport: http(),
  })

  const { request } = await prepare(hoisted, {
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1n,
  })

  expectTypeOf(request.account).toEqualTypeOf<Account.PrivateKey>()
  expectTypeOf(request.from).toEqualTypeOf<Address.Address>()
})

test('behavior: no account → from is optional', async () => {
  const { request } = await prepare(client, {
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1n,
  })

  expectTypeOf(request.account).toEqualTypeOf<undefined>()
})

test('decorator: account threads through publicActions', async () => {
  const decorated = Client.create({
    account: Account.fromPrivateKey('0x'),
    chain: mainnet,
    transport: http(),
  }).extend(publicActions())

  const { request } = await decorated.transaction.prepare({
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1n,
  })

  expectTypeOf(request.account).toEqualTypeOf<Account.PrivateKey>()
  expectTypeOf(request.from).toEqualTypeOf<Address.Address>()
})

test('decorator: account threads through walletActions', async () => {
  const decorated = Client.create({
    account: Account.fromPrivateKey('0x'),
    chain: mainnet,
    transport: http(),
  }).extend(walletActions())

  const { request } = await decorated.transaction.prepare({
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1n,
  })

  expectTypeOf(request.account).toEqualTypeOf<Account.PrivateKey>()
  expectTypeOf(request.from).toEqualTypeOf<Address.Address>()
})

test('parameters: request input is the ox default', () => {
  expectTypeOf<prepare.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

test('parameters: control fields are present with expected types', () => {
  expectTypeOf<prepare.Options['account']>().toEqualTypeOf<
    Account.Account | Address.Address | undefined
  >()
  expectTypeOf<prepare.Options['chain']>().toEqualTypeOf<
    Chain.Chain | undefined
  >()
  expectTypeOf<prepare.Options['chainId']>().toEqualTypeOf<number | undefined>()
  expectTypeOf<prepare.Options['kzg']>().toEqualTypeOf<Kzg.Kzg | undefined>()
  expectTypeOf<prepare.Options['nonceManager']>().toEqualTypeOf<
    NonceManager.NonceManager | undefined
  >()
  expectTypeOf<prepare.Options['parameters']>().toEqualTypeOf<
    readonly prepare.Parameter[] | undefined
  >()
})

test('parameters: a fully-populated request literal is accepted', () => {
  expectTypeOf({
    account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    chainId: 1,
    gas: 21000n,
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
    nonce: 0,
    parameters: ['fees', 'gas', 'nonce'],
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    type: 'eip1559',
    value: 1n,
  } as const satisfies prepare.Options).toMatchTypeOf<prepare.Options>()
})

// A chain whose request converter accepts a custom input field.
const chainWithSchema = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
  codecs: {
    transactionRequest: {
      toRpc: (_request: { custom: string }): TransactionRequest.Rpc => ({}),
    },
  },
})

test('parameters: chain codecs request field threads through Options', () => {
  expectTypeOf<prepare.Options<typeof chainWithSchema>>().toMatchTypeOf<{
    custom: string
  }>()
})

test('parameters: public decorator accepts control + custom request fields', () => {
  const decorated = Client.create({
    chain: chainWithSchema,
    transport: http(),
  }).extend(publicActions())

  expectTypeOf(decorated.transaction.prepare).parameter(0).toMatchTypeOf<{
    account?: Account.Account | Address.Address | undefined
    custom: string
    parameters?: readonly prepare.Parameter[] | undefined
  }>()
})

test('parameters: wallet decorator accepts control + custom request fields', () => {
  const decorated = Client.create({
    chain: chainWithSchema,
    transport: http(),
  }).extend(walletActions())

  expectTypeOf(decorated.transaction.prepare).parameter(0).toMatchTypeOf<{
    account?: Account.Account | Address.Address | undefined
    custom: string
    parameters?: readonly prepare.Parameter[] | undefined
  }>()
})
