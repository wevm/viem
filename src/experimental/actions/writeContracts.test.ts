import { expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/src/abis.js'
import { accounts, localHttpUrl } from '../../../test/src/constants.js'
import { testClient } from '../../../test/src/utils.js'
import { mine } from '../../actions/index.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { RpcRequestError } from '../../errors/request.js'
import type { WalletCallReceipt } from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import { getHttpRpcClient } from '../../utils/index.js'
import { uid } from '../../utils/uid.js'
import { getCallsReceipt } from './getCallsReceipt.js'
import { writeContracts } from './writeContracts.js'

type Uid = string
type TxHashes = Hex[]
const calls = new Map<Uid, TxHashes[]>()

const getClient = ({
  onRequest,
}: { onRequest({ method, params }: any): void }) =>
  createClient({
    transport: custom({
      async request({ method, params }) {
        onRequest({ method, params })

        const rpcClient = getHttpRpcClient(localHttpUrl)

        if (method === 'wallet_getCallsReceipt') {
          const hashes = calls.get(params)
          if (!hashes) return null
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
                  url: localHttpUrl,
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
          for (const call of params.calls) {
            const callResult = await rpcClient.request({
              body: {
                method: 'eth_call',
                params: [{ ...call, from: params.from }],
                id: 0,
              },
            })
            if (callResult.error) throw new Error(callResult.error.message)

            const { result, error } = await rpcClient.request({
              body: {
                method: 'eth_sendTransaction',
                params: [{ ...call, from: params.from }],
                id: 0,
              },
            })
            if (error)
              throw new RpcRequestError({
                body: { method, params },
                error,
                url: localHttpUrl,
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

  const id_ = await writeContracts(client, {
    account: accounts[0].address,
    chain: mainnet,
    contracts: [
      {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [69420n],
      },
      {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [69421n],
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
      {
        "calls": [
          {
            "data": "0xa0712d680000000000000000000000000000000000000000000000000000000000010f2c",
            "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
            "value": undefined,
          },
          {
            "data": "0xa0712d680000000000000000000000000000000000000000000000000000000000010f2d",
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
    ]
  `)

  await mine(testClient, { blocks: 3 })

  const { receipts } = await getCallsReceipt(client, { id: id_ })

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
        "gasUsed": 73684n,
        "logs": [
          {
            "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
            "blockHash": undefined,
            "blockNumber": "0xf86cc3",
            "data": "0x",
            "logIndex": "0x0",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000000000000000000000000000000000000000010f2c",
            ],
            "transactionHash": "0xe88636585d9ce6ca15aaa480267217f1cb57dd4cec15604ca55bce6934aee3bd",
            "transactionIndex": "0x0",
          },
        ],
        "status": "success",
        "transactionHash": "0xe88636585d9ce6ca15aaa480267217f1cb57dd4cec15604ca55bce6934aee3bd",
      },
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 130268n,
        "logs": [
          {
            "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
            "blockHash": undefined,
            "blockNumber": "0xf86cc3",
            "data": "0x",
            "logIndex": "0x1",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000000000000000000000000000000000000000010f2d",
            ],
            "transactionHash": "0x742e22ff1a9b835bd86e191fcd1998d4657893d9355d42fa8700b1ab5df7a890",
            "transactionIndex": "0x1",
          },
        ],
        "status": "success",
        "transactionHash": "0x742e22ff1a9b835bd86e191fcd1998d4657893d9355d42fa8700b1ab5df7a890",
      },
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 191562n,
        "logs": [
          {
            "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
            "blockHash": undefined,
            "blockNumber": "0xf86cc3",
            "data": "0x",
            "logIndex": "0x2",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000000000000000000000000000000000000000000221",
            ],
            "transactionHash": "0x33cbd0bfa4db7902da7d119b405de9075610cd53e817329055d36ad0df85a654",
            "transactionIndex": "0x2",
          },
        ],
        "status": "success",
        "transactionHash": "0x33cbd0bfa4db7902da7d119b405de9075610cd53e817329055d36ad0df85a654",
      },
    ]
  `)
})
