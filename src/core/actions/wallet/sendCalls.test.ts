import * as Hex from 'ox/Hex'
import * as Provider from 'ox/Provider'
import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'
import { Client, custom, http, testActions, walletActions } from 'viem'
import { mainnet } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { uid } from '../../internal/uid.js'
import {
  fallbackMagicIdentifier,
  fallbackTransactionErrorMagicIdentifier,
  sendCalls,
} from './sendCalls.js'

type Uid = string
type TxHashes = Hex.Hex[]
const calls = new Map<Uid, TxHashes>()
const node = http(anvil.mainnet.rpcUrl.http).setup({})
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())
const erc721 = {
  abi: generated.Erc721.abi,
  address: (
    await contract.deploy(anvil.getClient(anvil.mainnet), {
      bytecode: generated.Erc721.bytecode.object,
    })
  ).address,
}

function expectFallbackId(id: string, callCount: number) {
  expect(id).toMatch(/^0x(?:[0-9a-f]{64})+$/)
  const chunks =
    id
      .slice(2)
      .match(/.{64}/g)
      ?.map((chunk) => `0x${chunk}` as Hex.Hex) ?? []
  expect(chunks).toHaveLength(callCount + 2)
  expect(chunks.at(-2)).toBe(Hex.fromNumber(mainnet.id, { size: 32 }))
  expect(chunks.at(-1)).toBe(fallbackMagicIdentifier)
  return chunks.slice(0, callCount)
}

function getClient({
  chain,
  onRequest,
}: {
  chain?: typeof mainnet | undefined
  onRequest(parameters: { method: string; params: any }): void
}) {
  return Client.create({
    chain,
    transport: custom(
      Provider.from({
        async request({ method, params }: any) {
          onRequest({ method, params })
          if (method === 'wallet_sendCalls') {
            const hashes: Hex.Hex[] = []
            for (const call of params[0].calls) {
              await node.request({
                method: 'eth_call',
                params: [
                  {
                    ...call,
                    from: params[0].from ?? constants.accounts[0].address,
                  },
                ],
              })
              hashes.push(
                await node.request({
                  method: 'eth_sendTransaction',
                  params: [
                    {
                      ...call,
                      from: params[0].from ?? constants.accounts[0].address,
                    },
                  ],
                }),
              )
            }
            const id = uid()
            calls.set(id, hashes)
            return id
          }
          if (method.startsWith('eth_')) return node.request({ method, params })
          return null
        },
      }),
    ),
  })
}

const batch = [
  { to: constants.accounts[1].address, value: Value.fromEther('1') },
  { to: constants.accounts[2].address },
  {
    data: '0xcafebabe' as const,
    to: constants.accounts[3].address,
    value: Value.fromEther('100'),
  },
  { abi: erc721.abi, functionName: 'mint', to: erc721.address },
  { abi: erc721.abi, functionName: 'mint', to: erc721.address },
] as const

test('default', async () => {
  const requests: unknown[] = []
  const client = getClient({ onRequest: ({ params }) => requests.push(params) })
  const response = await sendCalls(client, {
    account: constants.accounts[0].address,
    chain: mainnet,
    calls: batch,
  })
  expect(response.id).toBeDefined()
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "atomicRequired": false,
          "calls": [
            {
              "data": undefined,
              "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
              "value": "0xde0b6b3a7640000",
            },
            {
              "data": undefined,
              "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
              "value": undefined,
            },
            {
              "data": "0xcafebabe",
              "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
              "value": "0x56bc75e2d63100000",
            },
            {
              "data": "0x1249c58b",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
            {
              "data": "0x1249c58b",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
          ],
          "capabilities": undefined,
          "chainId": "0x1",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "id": undefined,
          "version": "2.0.0",
        },
      ],
    ]
  `)
})

test('behavior: chain on client', async () => {
  const requests: unknown[] = []
  const client = getClient({
    chain: mainnet,
    onRequest: ({ params }) => requests.push(params),
  })
  const response = await sendCalls(client, {
    account: constants.accounts[0].address,
    calls: batch,
  })
  expect(response.id).toBeDefined()
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "atomicRequired": false,
          "calls": [
            {
              "data": undefined,
              "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
              "value": "0xde0b6b3a7640000",
            },
            {
              "data": undefined,
              "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
              "value": undefined,
            },
            {
              "data": "0xcafebabe",
              "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
              "value": "0x56bc75e2d63100000",
            },
            {
              "data": "0x1249c58b",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
            {
              "data": "0x1249c58b",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
          ],
          "capabilities": undefined,
          "chainId": "0x1",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "id": undefined,
          "version": "2.0.0",
        },
      ],
    ]
  `)
})

test('behavior: inferred account', async () => {
  const requests: unknown[] = []
  const client = getClient({ onRequest: ({ params }) => requests.push(params) })
  const response = await sendCalls(client, { chain: mainnet, calls: batch })
  expect(response.id).toBeDefined()
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "atomicRequired": false,
          "calls": [
            {
              "data": undefined,
              "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
              "value": "0xde0b6b3a7640000",
            },
            {
              "data": undefined,
              "to": "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
              "value": undefined,
            },
            {
              "data": "0xcafebabe",
              "to": "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
              "value": "0x56bc75e2d63100000",
            },
            {
              "data": "0x1249c58b",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
            {
              "data": "0x1249c58b",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
          ],
          "capabilities": undefined,
          "chainId": "0x1",
          "from": undefined,
          "id": undefined,
          "version": "2.0.0",
        },
      ],
    ]
  `)
})

test('behavior: capability: paymasterService', async () => {
  const requests: unknown[] = []
  const client = getClient({ onRequest: ({ params }) => requests.push(params) })
  const response = await sendCalls(client, {
    account: constants.accounts[0].address,
    capabilities: { paymasterService: { url: 'https://paymaster.com' } },
    chain: mainnet,
    calls: [{ to: constants.accounts[1].address, value: Value.fromEther('1') }],
  })
  expect(response.id).toBeDefined()
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "atomicRequired": false,
          "calls": [
            {
              "data": undefined,
              "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
              "value": "0xde0b6b3a7640000",
            },
          ],
          "capabilities": {
            "paymasterService": {
              "url": "https://paymaster.com",
            },
          },
          "chainId": "0x1",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "id": undefined,
          "version": "2.0.0",
        },
      ],
    ]
  `)
})

describe('behavior: eth_sendTransaction fallback', () => {
  const client = anvil.getClient(anvil.mainnet)

  test('default', async () => {
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: batch.slice(0, 4),
      experimental_fallback: true,
    })
    const hashes = expectFallbackId(response.id, 4)
    expect(hashes).not.toContain(fallbackTransactionErrorMagicIdentifier)
  })

  test('behavior: optional capabilities', async () => {
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: batch.slice(0, 4),
      experimental_fallback: true,
      capabilities: {
        paymasterService: { optional: true, url: 'https://example.com' },
      },
    })
    expect(response.id).toBeDefined()
  })

  test('behavior: non-optional capabilities', async () => {
    await expect(() =>
      sendCalls(client, {
        account: constants.accounts[0].address,
        chain: mainnet,
        calls: batch.slice(0, 4),
        experimental_fallback: true,
        capabilities: { paymasterService: { url: 'https://example.com' } },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Actions.wallet.sendCalls.UnsupportedNonOptionalCapabilityError: non-optional \`capabilities\` are not supported on fallback to \`eth_sendTransaction\`.

      Version: viem@2.52.1]
    `)
  })

  test('behavior: atomic', async () => {
    await expect(() =>
      sendCalls(client, {
        account: constants.accounts[0].address,
        chain: mainnet,
        calls: batch.slice(0, 4),
        experimental_fallback: true,
        forceAtomic: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Actions.wallet.sendCalls.AtomicityNotSupportedError: \`forceAtomic\` is not supported on fallback to \`eth_sendTransaction\`.

      Version: viem@2.52.1]
    `)
  })

  test('behavior: insufficient funds (complete)', async () => {
    await expect(() =>
      sendCalls(client, {
        account: constants.accounts[0].address,
        chain: mainnet,
        calls: [
          {
            to: constants.accounts[1].address,
            value: Value.fromEther('99999'),
          },
          {
            to: constants.accounts[2].address,
            value: Value.fromEther('99999'),
          },
          {
            data: '0xcafebabe',
            to: constants.accounts[3].address,
            value: Value.fromEther('99999'),
          },
        ],
        experimental_fallback: true,
        experimental_fallbackDelay: 0,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [RpcError.ExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

      This error could arise when the account does not have enough funds to:
       - pay for the total gas fee,
       - pay for the value to send.
       
      The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
       - \`gas\` is the amount of gas needed for transaction to execute,
       - \`gas fee\` is the gas fee,
       - \`value\` is the amount of ether to send to the recipient.
       
      Request Arguments:
        chain:  Ethereum (id: 1)
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  99999 ETH

      Details: Insufficient funds for gas * price + value
      Version: viem@2.52.1]
    `)
  })

  test('behavior: insufficient funds (partial)', async () => {
    await testClient.address.setBalance({
      address: constants.accounts[0].address,
      value: constants.accounts[0].balance,
    })
    await testClient.block.mine({ blocks: 1 })
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
        { to: constants.accounts[2].address, value: Value.fromEther('1') },
        {
          data: '0xcafebabe',
          to: constants.accounts[3].address,
          value: Value.fromEther('99999'),
        },
      ],
      experimental_fallback: true,
      experimental_fallbackDelay: 0,
    })
    const hashes = expectFallbackId(response.id, 3)
    expect(hashes).toContain(fallbackTransactionErrorMagicIdentifier)
  })
})

test('error: insufficient funds', async () => {
  const client = getClient({ chain: mainnet, onRequest() {} })
  await expect(() =>
    sendCalls(client, {
      account: constants.accounts[0].address,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
        { to: constants.accounts[2].address, value: Value.fromEther('10') },
        {
          data: '0xcafebabe',
          to: constants.accounts[3].address,
          value: Value.fromEther('1000000'),
        },
      ],
      chain: mainnet,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Request Arguments:
      chain:  Ethereum (id: 1)
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Details: Insufficient funds for gas * price + value
    Version: viem@2.52.1]
  `)
})

test('args: dataSuffix', async () => {
  const requests: unknown[] = []
  const client = getClient({ onRequest: ({ params }) => requests.push(params) })
  const response = await sendCalls(client, {
    account: constants.accounts[0].address,
    chain: mainnet,
    calls: [
      {
        abi: erc721.abi,
        functionName: 'mint',
        to: erc721.address,
        dataSuffix: '0x12345678',
      },
    ],
  })
  expect(response.id).toBeDefined()
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "atomicRequired": false,
          "calls": [
            {
              "data": "0x1249c58b12345678",
              "to": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
              "value": undefined,
            },
          ],
          "capabilities": undefined,
          "chainId": "0x1",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "id": undefined,
          "version": "2.0.0",
        },
      ],
    ]
  `)
})

describe('behavior: client dataSuffix', () => {
  function getClientWithDataSuffix({
    dataSuffix,
    onRequest,
  }: {
    dataSuffix: Hex.Hex | { value: Hex.Hex; required?: boolean | undefined }
    onRequest(parameters: { method: string; params: any }): void
  }) {
    return Client.create({
      dataSuffix,
      transport: custom(
        Provider.from({
          async request({ method, params }: any) {
            onRequest({ method, params })
            if (method === 'wallet_sendCalls') return uid()
            return null
          },
        }),
      ),
    })
  }

  test('applies client dataSuffix as optional capability (hex string)', async () => {
    const requests: unknown[] = []
    const client = getClientWithDataSuffix({
      dataSuffix: '0x12345678',
      onRequest: ({ params }) => requests.push(params),
    })
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
      ],
    })
    expect(response.id).toBeDefined()
    expect(requests).toMatchInlineSnapshot(`
      [
        [
          {
            "atomicRequired": false,
            "calls": [
              {
                "data": undefined,
                "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                "value": "0xde0b6b3a7640000",
              },
            ],
            "capabilities": {
              "dataSuffix": {
                "optional": true,
                "value": "0x12345678",
              },
            },
            "chainId": "0x1",
            "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "id": undefined,
            "version": "2.0.0",
          },
        ],
      ]
    `)
  })

  test('applies client dataSuffix as required capability (object format)', async () => {
    const requests: unknown[] = []
    const client = getClientWithDataSuffix({
      dataSuffix: { value: '0x12345678', required: true },
      onRequest: ({ params }) => requests.push(params),
    })
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
      ],
    })
    expect(response.id).toBeDefined()
    expect(requests).toMatchInlineSnapshot(`
      [
        [
          {
            "atomicRequired": false,
            "calls": [
              {
                "data": undefined,
                "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                "value": "0xde0b6b3a7640000",
              },
            ],
            "capabilities": {
              "dataSuffix": {
                "value": "0x12345678",
              },
            },
            "chainId": "0x1",
            "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "id": undefined,
            "version": "2.0.0",
          },
        ],
      ]
    `)
  })

  test('action capabilities.dataSuffix overrides client dataSuffix', async () => {
    const requests: unknown[] = []
    const client = getClientWithDataSuffix({
      dataSuffix: '0xclientdata',
      onRequest: ({ params }) => requests.push(params),
    })
    const response = await sendCalls(client, {
      account: constants.accounts[0].address,
      chain: mainnet,
      capabilities: { dataSuffix: { value: '0xactiondata' } },
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
      ],
    })
    expect(response.id).toBeDefined()
    expect(requests).toMatchInlineSnapshot(`
      [
        [
          {
            "atomicRequired": false,
            "calls": [
              {
                "data": undefined,
                "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                "value": "0xde0b6b3a7640000",
              },
            ],
            "capabilities": {
              "dataSuffix": {
                "value": "0xactiondata",
              },
            },
            "chainId": "0x1",
            "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "id": undefined,
            "version": "2.0.0",
          },
        ],
      ]
    `)
  })

  test('applies client dataSuffix via decorated method (client.wallet.sendCalls)', async () => {
    const requests: unknown[] = []
    const client = Client.create({
      dataSuffix: '0x12345678',
      transport: custom(
        Provider.from({
          async request({ method, params }: any) {
            requests.push(params)
            if (method === 'wallet_sendCalls') return uid()
            return null
          },
        }),
      ),
    }).extend(walletActions())
    const response = await client.wallet.sendCalls({
      account: constants.accounts[0].address,
      chain: mainnet,
      calls: [
        { to: constants.accounts[1].address, value: Value.fromEther('1') },
      ],
    })
    expect(response.id).toBeDefined()
    expect(requests).toMatchInlineSnapshot(`
      [
        [
          {
            "atomicRequired": false,
            "calls": [
              {
                "data": undefined,
                "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
                "value": "0xde0b6b3a7640000",
              },
            ],
            "capabilities": {
              "dataSuffix": {
                "optional": true,
                "value": "0x12345678",
              },
            },
            "chainId": "0x1",
            "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "id": undefined,
            "version": "2.0.0",
          },
        ],
      ]
    `)
  })
})
