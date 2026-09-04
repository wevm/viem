import { Hex, RpcResponse, Secp256k1 } from 'ox'
import { MultisigConfig } from 'ox/tempo'
import { custom } from 'viem'
import { tempoLocalnet as chain } from 'viem/chains'
import {
  Account as Account_,
  Client,
  Store,
  http,
  withMultisig,
  withRelay,
} from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { chainConfig } from './chainConfig.js'

describe('withMultisig', () => {
  test('default', async () => {
    const client = Client.create({
      transport: withMultisig(http(), { store: Store.memory() }),
    })

    expect(client.transport.multisig).toMatchInlineSnapshot(`true`)
    expect(client.transport.url).toBe('https://rpc.tempo.xyz')
    await expect(
      client.request({
        method: 'multisig_getOperation',
        params: [`0x${'ff'.repeat(32)}`],
      } as never),
    ).resolves.toMatchInlineSnapshot(`null`)
  })

  test('error: non-atomic store', () => {
    const store = Store.from({
      getItem: async () => null,
      removeItem() {},
      setItem() {},
    })

    expect(() =>
      Client.create({
        transport: withMultisig(http(), { store } as never),
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [RpcResponse.InvalidParamsError: Multisig coordination requires a store with atomic \`compareAndSet\`.]
    `)
  })
})

test('behavior: routes multisig coordination to the relay', async () => {
  const owner = Account_.fromSecp256k1(Secp256k1.randomPrivateKey())
  const config = MultisigConfig.from({
    owners: [{ owner: owner.address, weight: 1 }],
    threshold: 1,
  })
  const transaction = {
    calls: [
      { data: '0xdeadbeef', to: '0x0000000000000000000000000000000000000020' },
    ],
    chainId: chain.id,
    multisigSimulation: {
      account: MultisigConfig.getAddress(config),
      approvals: [{ owner: owner.address, type: 'primitive' as const }],
      config,
    },
  } as const
  const signature = await owner.signTransaction(transaction)
  const serialized = await chainConfig.transaction.serialize({
    ...transaction,
    signatures: [signature],
  })
  const defaultMethods: string[] = []
  const relayMethods: string[] = []
  const transport = withRelay(
    custom({
      async request({ method }) {
        defaultMethods.push(method)
        return method
      },
    }),
    custom({
      async request({ method }) {
        relayMethods.push(method)
        return method
      },
    }),
  ).setup({ chain, retryCount: 0 })
  const hash = `0x${'01'.repeat(32)}`

  const results = await Promise.all(
    [
      { method: 'eth_sendRawTransaction', params: [serialized] },
      { method: 'eth_sendRawTransactionSync', params: [serialized] },
      {
        method: 'multisig_approveKeyAuthorization',
        params: [{ hash, signature }],
      },
      { method: 'multisig_approveRawTransaction', params: [serialized] },
      { method: 'multisig_approveRawTransactionSync', params: [serialized] },
      { method: 'multisig_getConfig', params: [{ address: owner.address }] },
      { method: 'multisig_getOperation', params: [hash] },
    ].map((request) => transport.request(request as never)),
  )

  expect(transport.multisig).toBe(true)
  expect(results).toMatchInlineSnapshot(`
      [
        "eth_sendRawTransaction",
        "eth_sendRawTransactionSync",
        "multisig_approveKeyAuthorization",
        "multisig_approveRawTransaction",
        "multisig_approveRawTransactionSync",
        "multisig_getConfig",
        "multisig_getOperation",
      ]
    `)
  expect(defaultMethods).toMatchInlineSnapshot(`[]`)
  expect(relayMethods).toStrictEqual(results)
})

test('behavior: routes transaction lookups to their source', async () => {
  const transactionHash: Hex.Hex = `0x${'01'.repeat(32)}`
  const operationHash: Hex.Hex = `0x${'02'.repeat(32)}`
  const unknownHash: Hex.Hex = `0x${'03'.repeat(32)}`
  const unsupportedHash: Hex.Hex = `0x${'04'.repeat(32)}`
  const defaultRequests: string[] = []
  const relayRequests: string[] = []
  const transport = withRelay(
    custom({
      async request({ method, params }) {
        const hash = (params as readonly unknown[] | undefined)?.[0]
        defaultRequests.push(`${method}:${hash}`)
        if (hash === transactionHash)
          return { hash: transactionHash, source: 'default' }
        return null
      },
    }),
    custom({
      async request({ method, params }) {
        const hash = (params as readonly unknown[] | undefined)?.[0]
        relayRequests.push(`${method}:${hash}`)
        if (method === 'multisig_getOperation') {
          if (hash === operationHash) return { type: 'transaction' }
          if (hash === unsupportedHash)
            throw new RpcResponse.MethodNotSupportedError()
          throw new RpcResponse.MethodNotFoundError()
        }
        return { hash: operationHash, source: 'relay' }
      },
    }),
  ).setup({ chain, retryCount: 0 })

  const results = [
    await transport.request({
      method: 'eth_getTransactionByHash',
      params: [transactionHash],
    }),
    await transport.request({
      method: 'eth_getTransactionReceipt',
      params: [transactionHash],
    }),
    await transport.request({
      method: 'eth_getTransactionByHash',
      params: [operationHash],
    }),
    await transport.request({
      method: 'eth_getTransactionReceipt',
      params: [operationHash],
    }),
    await transport.request({
      method: 'eth_getTransactionReceipt',
      params: [unknownHash],
    }),
    await transport.request({
      method: 'eth_getTransactionReceipt',
      params: [unsupportedHash],
    }),
  ]

  expect(results).toMatchInlineSnapshot(`
      [
        {
          "hash": "0x0101010101010101010101010101010101010101010101010101010101010101",
          "source": "default",
        },
        {
          "hash": "0x0101010101010101010101010101010101010101010101010101010101010101",
          "source": "default",
        },
        {
          "hash": "0x0202020202020202020202020202020202020202020202020202020202020202",
          "source": "relay",
        },
        {
          "hash": "0x0202020202020202020202020202020202020202020202020202020202020202",
          "source": "relay",
        },
        null,
        null,
      ]
    `)
  expect(defaultRequests).toMatchInlineSnapshot(`
      [
        "eth_getTransactionByHash:0x0101010101010101010101010101010101010101010101010101010101010101",
        "eth_getTransactionReceipt:0x0101010101010101010101010101010101010101010101010101010101010101",
        "eth_getTransactionByHash:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionReceipt:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionReceipt:0x0303030303030303030303030303030303030303030303030303030303030303",
        "eth_getTransactionReceipt:0x0404040404040404040404040404040404040404040404040404040404040404",
      ]
    `)
  expect(relayRequests).toMatchInlineSnapshot(`
      [
        "multisig_getOperation:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionByHash:0x0202020202020202020202020202020202020202020202020202020202020202",
        "multisig_getOperation:0x0202020202020202020202020202020202020202020202020202020202020202",
        "eth_getTransactionReceipt:0x0202020202020202020202020202020202020202020202020202020202020202",
        "multisig_getOperation:0x0303030303030303030303030303030303030303030303030303030303030303",
        "multisig_getOperation:0x0404040404040404040404040404040404040404040404040404040404040404",
      ]
    `)
})

test('behavior: propagates relay transaction lookup failures', async () => {
  const transport = withRelay(
    custom({ request: async () => null }),
    custom({
      async request() {
        throw new RpcResponse.InternalError({
          message: 'Relay lookup failed.',
        })
      },
    }),
  ).setup({ chain, retryCount: 0 })

  await expect(
    transport.request(
      {
        method: 'eth_getTransactionByHash',
        params: [`0x${'05'.repeat(32)}`],
      },
      { retryCount: 0 },
    ),
  ).rejects.toThrow('Relay lookup failed.')
})
