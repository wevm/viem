import { describe, expectTypeOf, test } from 'vp/test'

import { Account, Chain, Client, http } from '../index.js'
import type * as Hex from '../utils/Hex.js'
import { RpcSchema } from '../utils/index.js'
import * as ClientSubpath from 'viem/Client'

const address = '0x0000000000000000000000000000000000000000'
const chain = Chain.define({
  id: 1n,
  name: 'Test',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://example.com'] } },
})

describe('Client', () => {
  test('types: is exposed from the root and subpath entrypoints', () => {
    expectTypeOf(Client.create).toEqualTypeOf<typeof ClientSubpath.create>()
    expectTypeOf<Client.Client>().toEqualTypeOf<ClientSubpath.Client>()
    expectTypeOf<Client.Options>().toEqualTypeOf<ClientSubpath.Options>()

    // @ts-expect-error - RPC schema markers live under viem/utils.
    expectTypeOf(Client.rpcSchema).toBeNever()
  })

  test('types: preserves chain inference', () => {
    const client = Client.create({
      chain,
      transport: http(),
    })

    expectTypeOf(client.chain).toEqualTypeOf<typeof chain>()
    expectTypeOf(client.account).toEqualTypeOf<undefined>()
  })

  test('types: orders generics by client slots', () => {
    const transport = http()
    type Client_ = Client.Client<
      typeof chain,
      Account.JsonRpc<typeof address>,
      typeof transport
    >

    expectTypeOf<Client_['chain']>().toEqualTypeOf<typeof chain>()
    expectTypeOf<Client_['account']>().toEqualTypeOf<
      Account.JsonRpc<typeof address>
    >()
    expectTypeOf<Client_['transport']['type']>().toEqualTypeOf<'http'>()
  })

  test('types: preserves absent chain inference', () => {
    const client = Client.create({
      transport: http(),
    })

    expectTypeOf(client.chain).toEqualTypeOf<undefined>()
  })

  test('types: normalizes address accounts', () => {
    const client = Client.create({
      account: address,
      transport: http(),
    })

    expectTypeOf(client.account).toEqualTypeOf<
      Account.JsonRpc<typeof address>
    >()
  })

  test('types: preserves local accounts', () => {
    const account = Account.fromLocal({
      address,
      async sign() {
        return '0x'
      },
    })
    const client = Client.create({
      account,
      transport: http(),
    })

    expectTypeOf(client.account).toEqualTypeOf<typeof account>()
  })

  test('types: accepts Ox RPC schemas', async () => {
    type Schema = RpcSchema.From<{
      Request: {
        method: 'example_getValue'
        params: [id: number]
      }
      ReturnType: string
    }>

    const client = Client.create({
      rpcSchema: RpcSchema.from<Schema>(),
      transport: http(),
    })

    const result = await client.request({
      method: 'example_getValue',
      params: [1],
    })
    const blockNumber = await client.request({
      method: 'eth_blockNumber',
    })
    expectTypeOf(result).toEqualTypeOf<string>()
    expectTypeOf(blockNumber).toEqualTypeOf<Hex.Hex>()

    // @ts-expect-error - params must match the RPC schema.
    client.request({ method: 'example_getValue', params: ['1'] })
  })

  test('types: infers extensions', () => {
    const client = Client.create({
      transport: http(),
    }).extend((client) => ({
      public: {
        getUid: () => client.uid,
      },
    }))

    expectTypeOf(client.public.getUid()).toEqualTypeOf<`0x${string}`>()
  })

  test('types: chains extensions', () => {
    const client = Client.create({
      transport: http(),
    })
      .extend(() => ({
        public: { getBlockNumber: async () => 1n },
      }))
      .extend((client) => ({
        wallet: { getBlockNumber: client.public.getBlockNumber },
      }))

    expectTypeOf(client.wallet.getBlockNumber).toEqualTypeOf<
      typeof client.public.getBlockNumber
    >()
  })

  test('types: rejects protected base key overrides', () => {
    Client.create({
      transport: http(),
    }).extend(
      // @ts-expect-error - base Client keys cannot be overridden.
      () => ({
        key: 'unsafe',
      }),
    )
  })
})
