import { describe, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { type Chain, mainnet } from '../../chains/index.js'
import { type Client, createClient } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { custom } from '../../clients/transports/custom.js'
import { RpcRequestError } from '../../errors/request.js'
import type {
  WalletCallReceipt,
  WalletGetCallsStatusReturnType,
} from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import { getHttpRpcClient, parseEther } from '../../utils/index.js'
import { uid } from '../../utils/uid.js'
import { sendCalls } from './sendCalls.js'

type Uid = string
type TxHashes = Hex[]
const calls = new Map<Uid, TxHashes[]>()

const getClient = <chain extends Chain | undefined = undefined>({
  chain,
  onRequest,
}: {
  chain?: chain | undefined
  onRequest({ method, params }: any): void
}): Client<Transport, chain> =>
  createClient({
    chain,
    transport: custom({
      async request({ method, params }) {
        onRequest({ method, params })

        const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)

        if (method === 'wallet_getCallsStatus') {
          const hashes = calls.get(params[0])
          if (!hashes)
            return {
              atomic: false,
              chainId: '0x1',
              id: params[0],
              status: 100,
              receipts: [],
              version: '2.0.0',
            } satisfies WalletGetCallsStatusReturnType

          const receipts = await Promise.all(
            hashes.map(async (hash) => {
              const { result, error } = await rpcClient.request({
                body: {
                  method: 'eth_getTransactionReceipt',
                  params: [hash],
                  id: 0,
                },
              })
              if (error)
                throw new RpcRequestError({
                  body: { method, params },
                  error,
                  url: anvilMainnet.rpcUrl.http,
                })
              if (!result) throw new Error('receipt not found')
              return {
                blockHash: result.blockHash,
                blockNumber: result.blockNumber,
                gasUsed: result.gasUsed,
                logs: result.logs,
                status: result.status,
                transactionHash: result.transactionHash,
              } satisfies WalletCallReceipt
            }),
          )
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            status: 200,
            receipts,
            version: '2.0.0',
          } satisfies WalletGetCallsStatusReturnType
        }

        if (method === 'wallet_sendCalls') {
          const hashes = []
          for (const call of params[0].calls) {
            const callResult = await rpcClient.request({
              body: {
                method: 'eth_call',
                params: [
                  { ...call, from: params[0].from ?? accounts[0].address },
                ],
                id: 0,
              },
            })
            if (callResult.error) throw new Error(callResult.error.message)

            const { result, error } = await rpcClient.request({
              body: {
                method: 'eth_sendTransaction',
                params: [
                  { ...call, from: params[0].from ?? accounts[0].address },
                ],
                id: 0,
              },
            })
            if (error)
              throw new RpcRequestError({
                body: { method, params },
                error,
                url: anvilMainnet.rpcUrl.http,
              })
            hashes.push(result)
          }
          const uid_ = uid()
          calls.set(uid_, hashes)
          return uid_
        }

        return null
      },
    }),
  }) as never

test('default', async () => {
  const requests: unknown[] = []

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  const response = await sendCalls(client, {
    account: accounts[0].address,
    chain: mainnet,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
      },
      {
        data: '0xcafebabe',
        to: accounts[3].address,
        value: parseEther('100'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
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
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
              "value": undefined,
            },
            {
              "data": "0x1249c58b",
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
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
    onRequest({ params }) {
      requests.push(params)
    },
  })

  const { id } = await sendCalls(client, {
    account: accounts[0].address,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
      },
      {
        data: '0xcafebabe',
        to: accounts[3].address,
        value: parseEther('100'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
    ],
  })

  expect(id).toBeDefined()
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
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
              "value": undefined,
            },
            {
              "data": "0x1249c58b",
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
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

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  const { id } = await sendCalls(client, {
    account: null,
    chain: mainnet,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
      },
      {
        data: '0xcafebabe',
        to: accounts[3].address,
        value: parseEther('100'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
    ],
  })

  expect(id).toBeDefined()
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
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
              "value": undefined,
            },
            {
              "data": "0x1249c58b",
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
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

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  const response = await sendCalls(client, {
    account: accounts[0].address,
    capabilities: {
      paymasterService: {
        url: 'https://paymaster.com',
      },
    },
    chain: mainnet,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
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
  const client = anvilMainnet.getClient()

  test('default', async () => {
    const response = await sendCalls(client, {
      account: accounts[0].address,
      chain: mainnet,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('100'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
        },
      ],
      experimental_fallback: true,
    })

    expect(response.id).toMatchInlineSnapshot(
      `"0xb0fd8d440a3cb766200a237ad236241a70660e6f13398c880ed913fce620e8e5386fc7a922e91f765fc5034631f96c76a801071d0285fec1c43f856eb4445566e7941d94f9057aca5978cbeda09c96f6772ca5762c257867382a4da0cdea36dd6c1959f1051e01bb652246da0bb803ba6e678864cd6382b40c0bfb1ae1c3202600000000000000000000000000000000000000000000000000000000000000015792579257925792579257925792579257925792579257925792579257925792"`,
    )
  })

  test('behavior: optional capabilities', async () => {
    const response = await sendCalls(client, {
      account: accounts[0].address,
      chain: mainnet,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('100'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
        },
      ],
      experimental_fallback: true,
      capabilities: {
        paymasterService: {
          optional: true,
          url: 'https://example.com',
        },
      },
    })

    expect(response.id).toBeDefined()
  })

  test('behavior: non-optional capabilities', async () => {
    await expect(() =>
      sendCalls(client, {
        account: accounts[0].address,
        chain: mainnet,
        calls: [
          {
            to: accounts[1].address,
            value: parseEther('1'),
          },
          {
            to: accounts[2].address,
          },
          {
            data: '0xcafebabe',
            to: accounts[3].address,
            value: parseEther('100'),
          },
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: wagmiContractConfig.address,
          },
        ],
        experimental_fallback: true,
        capabilities: {
          paymasterService: {
            url: 'https://example.com',
          },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UnsupportedNonOptionalCapabilityError: This Wallet does not support a capability that was not marked as optional.

      Details: non-optional \`capabilities\` are not supported on fallback to \`eth_sendTransaction\`.
      Version: viem@x.y.z]
    `)
  })

  test('behavior: atomic', async () => {
    await expect(() =>
      sendCalls(client, {
        account: accounts[0].address,
        chain: mainnet,
        calls: [
          {
            to: accounts[1].address,
            value: parseEther('1'),
          },
          {
            to: accounts[2].address,
          },
          {
            data: '0xcafebabe',
            to: accounts[3].address,
            value: parseEther('100'),
          },
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: wagmiContractConfig.address,
          },
        ],
        experimental_fallback: true,
        forceAtomic: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AtomicityNotSupportedError: The wallet does not support atomic execution but the request requires it.

      Details: \`forceAtomic\` is not supported on fallback to \`eth_sendTransaction\`.
      Version: viem@x.y.z]
    `)
  })
})

test('error: no account', async () => {
  const requests: unknown[] = []

  const client = getClient({
    chain: mainnet,
    onRequest({ params }) {
      requests.push(params)
    },
  })

  await expect(() =>
    // @ts-expect-error
    sendCalls(client, {
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('10'),
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('1000000'),
        },
      ],
      chain: mainnet,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/actions/wallet/sendCalls
    Version: viem@x.y.z]
  `)
})

test('error: insufficient funds', async () => {
  const requests: unknown[] = []

  const client = getClient({
    chain: mainnet,
    onRequest({ params }) {
      requests.push(params)
    },
  })

  await expect(() =>
    sendCalls(client, {
      account: accounts[0].address,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('10'),
        },
        {
          data: '0xcafebabe',
          to: accounts[3].address,
          value: parseEther('1000000'),
        },
      ],
      chain: mainnet,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

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
    Version: viem@x.y.z]
  `)
})
