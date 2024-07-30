import { expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { mine, reset } from '../../../actions/index.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { RpcRequestError } from '../../../errors/request.js'
import type { WalletCallReceipt } from '../../../types/eip1193.js'
import type { Hex } from '../../../types/misc.js'
import { getHttpRpcClient } from '../../../utils/index.js'
import { uid } from '../../../utils/uid.js'
import { getCallsStatus } from './getCallsStatus.js'
import { writeContracts } from './writeContracts.js'

type Uid = string
type TxHashes = Hex[]
const calls = new Map<Uid, TxHashes[]>()

const testClient = anvilMainnet.getClient()

const getClient = ({
  onRequest,
}: { onRequest({ method, params }: any): void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        onRequest({ method, params })

        const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)

        if (method === 'wallet_getCallsStatus') {
          const hashes = calls.get(params[0])
          if (!hashes) return { status: 'PENDING', receipts: [] }
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
          return { status: 'CONFIRMED', receipts }
        }

        if (method === 'wallet_sendCalls') {
          const hashes = []
          for (const call of params[0].calls) {
            const callResult = await rpcClient.request({
              body: {
                method: 'eth_call',
                params: [{ ...call, from: params[0].from }],
                id: 0,
              },
            })
            if (callResult.error) throw new Error(callResult.error.message)

            const { result, error } = await rpcClient.request({
              body: {
                method: 'eth_sendTransaction',
                params: [{ ...call, from: params[0].from }],
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
  })

test('default', async () => {
  const requests: unknown[] = []

  const client = getClient({
    onRequest({ params }) {
      requests.push(params)
    },
  })

  await reset(testClient, {
    blockNumber: 16280770n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  const id_ = await writeContracts(client, {
    account: accounts[0].address,
    chain: mainnet,
    contracts: [
      {
        ...wagmiContractConfig,
        functionName: 'mint',
      },
      {
        ...wagmiContractConfig,
        functionName: 'mint',
      },
      {
        ...wagmiContractConfig,
        functionName: 'mint',
      },
    ],
  })

  expect(id_).toBeDefined()
  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "calls": [
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
            {
              "data": "0x1249c58b",
              "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
              "value": undefined,
            },
          ],
          "capabilities": undefined,
          "chainId": "0x1",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "version": "1.0",
        },
      ],
    ]
  `)

  await mine(testClient, { blocks: 3 })

  const { receipts } = await getCallsStatus(client, { id: id_ })

  expect(
    receipts?.map((receipt) => ({
      ...receipt,
      logs: receipt.logs.map((log) => ({ ...log, blockHash: undefined })),
      blockHash: undefined,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 78394n,
        "logs": [
          {
            "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
            "blockHash": undefined,
            "blockNumber": "0xf86cc3",
            "blockTimestamp": "0x63abc18c",
            "data": "0x",
            "logIndex": "0x0",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000000000000000000000000000000000000000000221",
            ],
            "transactionHash": "0x4c39dd461d9ad53eb3955e20480ec42392998247e868e09fe07858d2f819114a",
            "transactionIndex": "0x0",
          },
        ],
        "status": "success",
        "transactionHash": "0x4c39dd461d9ad53eb3955e20480ec42392998247e868e09fe07858d2f819114a",
      },
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 61294n,
        "logs": [
          {
            "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
            "blockHash": undefined,
            "blockNumber": "0xf86cc3",
            "blockTimestamp": "0x63abc18c",
            "data": "0x",
            "logIndex": "0x1",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000000000000000000000000000000000000000000222",
            ],
            "transactionHash": "0x2d7626de9490a86fb47e5c0d695f209fabb2d8622c93d26c3cda5f88c51ddbaa",
            "transactionIndex": "0x1",
          },
        ],
        "status": "success",
        "transactionHash": "0x2d7626de9490a86fb47e5c0d695f209fabb2d8622c93d26c3cda5f88c51ddbaa",
      },
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 61294n,
        "logs": [
          {
            "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
            "blockHash": undefined,
            "blockNumber": "0xf86cc3",
            "blockTimestamp": "0x63abc18c",
            "data": "0x",
            "logIndex": "0x2",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000000000000000000000000000000000000000000223",
            ],
            "transactionHash": "0x8fc061d08b93512dd4e7cdd64f69142f357010d574152baf47513338675c3237",
            "transactionIndex": "0x2",
          },
        ],
        "status": "success",
        "transactionHash": "0x8fc061d08b93512dd4e7cdd64f69142f357010d574152baf47513338675c3237",
      },
    ]
  `)
})
