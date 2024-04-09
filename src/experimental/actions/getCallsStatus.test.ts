import { expect, test } from 'vitest'
import { accounts, localHttpUrl } from '../../../test/src/constants.js'
import { testClient } from '../../../test/src/utils.js'
import { mine } from '../../actions/index.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { RpcRequestError } from '../../errors/request.js'
import type { WalletCallReceipt } from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import { getHttpRpcClient, parseEther } from '../../utils/index.js'
import { uid } from '../../utils/uid.js'
import { getCallsStatus } from './getCallsStatus.js'
import { sendCalls } from './sendCalls.js'

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

        if (method === 'wallet_getCallsStatus') {
          const hashes = calls.get(params[0])
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
            const { result, error } = await rpcClient.request({
              body: {
                method: 'eth_sendTransaction',
                params: [call],
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

  const id = await sendCalls(client, {
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
    ],
    chain: mainnet,
  })

  expect(id).toBeDefined()

  await mine(testClient, { blocks: 1 })

  const { status, receipts } = await getCallsStatus(client, { id })
  expect(status).toMatchInlineSnapshot(`"CONFIRMED"`)
  expect(receipts![0].blockHash).toBeDefined()
  expect(
    receipts?.map((x) => ({ ...x, blockHash: undefined })),
  ).toMatchInlineSnapshot(`
    [
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 21000n,
        "logs": [],
        "status": "success",
        "transactionHash": "0x66a7b39a0c4635c2f30cd191d7e1fb0bd370c11dd93199f236c5bdacfc9136b3",
      },
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 42000n,
        "logs": [],
        "status": "success",
        "transactionHash": "0x5fafca9937b154c21e7ea896c3ca23e5076ab9ca9e466085ae45edffb96c36e7",
      },
      {
        "blockHash": undefined,
        "blockNumber": 16280771n,
        "gasUsed": 63064n,
        "logs": [],
        "status": "success",
        "transactionHash": "0x84f1d37995973fa977fc45eccf3d1ac0cdf666541a7dc2613e9cd3bc356ddfa4",
      },
    ]
  `)
})
