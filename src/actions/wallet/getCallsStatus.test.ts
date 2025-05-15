import { describe, expect, test } from 'vitest'
import { ErrorsExample } from '../../../contracts/generated.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { deployErrorExample } from '../../../test/src/utils.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { RpcRequestError } from '../../errors/request.js'
import type {
  WalletCallReceipt,
  WalletGetCallsStatusReturnType,
} from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import { getHttpRpcClient, parseEther } from '../../utils/index.js'
import { uid } from '../../utils/uid.js'
import { mine } from '../index.js'
import { getCallsStatus } from './getCallsStatus.js'
import { sendCalls } from './sendCalls.js'

const testClient = anvilMainnet.getClient()

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

        const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)

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
                  url: anvilMainnet.rpcUrl.http,
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
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            receipts,
            status: 200,
            version: '2.0.0',
          } satisfies WalletGetCallsStatusReturnType
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
    ],
    chain: mainnet,
  })

  expect(id).toBeDefined()

  await mine(testClient, { blocks: 1 })

  const { id: id_, receipts, ...rest } = await getCallsStatus(client, { id })
  expect(id_).toBeDefined()
  expect(rest).toMatchInlineSnapshot(`
    {
      "atomic": false,
      "chainId": 1,
      "status": "success",
      "statusCode": 200,
      "version": "2.0.0",
    }
  `)
  expect(receipts!.length).toBe(3)
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
      ],
      experimental_fallback: true,
    })

    {
      const status = await getCallsStatus(client, response)
      expect(status).toMatchInlineSnapshot(`
        {
          "atomic": false,
          "chainId": 1,
          "receipts": [],
          "status": "pending",
          "statusCode": 100,
          "version": "2.0.0",
        }
      `)
    }

    await mine(client, { blocks: 1 })

    {
      const { receipts, ...rest } = await getCallsStatus(client, response)
      expect(receipts!.length).toBe(3)
      expect(rest).toMatchInlineSnapshot(`
        {
          "atomic": false,
          "chainId": 1,
          "status": "success",
          "statusCode": 200,
          "version": "2.0.0",
        }
      `)
    }
  })

  test('behavior: complete failure', async () => {
    const { contractAddress } = await deployErrorExample()

    const response = await sendCalls(client, {
      account: accounts[0].address,
      chain: mainnet,
      calls: [
        {
          abi: ErrorsExample.abi,
          to: contractAddress!,
          functionName: 'revertWrite',
        },
        {
          abi: ErrorsExample.abi,
          to: contractAddress!,
          functionName: 'simpleCustomWrite',
        },
      ],
      experimental_fallback: true,
    })

    {
      const status = await getCallsStatus(client, response)
      expect(status).toMatchInlineSnapshot(`
        {
          "atomic": false,
          "chainId": 1,
          "receipts": [],
          "status": "pending",
          "statusCode": 100,
          "version": "2.0.0",
        }
      `)
    }

    await mine(client, { blocks: 2 })

    {
      const { receipts, ...rest } = await getCallsStatus(client, response)
      expect(receipts!.length).toBe(2)
      expect(rest).toMatchInlineSnapshot(`
        {
          "atomic": false,
          "chainId": 1,
          "status": "failure",
          "statusCode": 500,
          "version": "2.0.0",
        }
      `)
    }
  })

  test('behavior: partial failure', async () => {
    const { contractAddress } = await deployErrorExample()

    const response = await sendCalls(client, {
      account: accounts[0].address,
      chain: mainnet,
      calls: [
        {
          abi: ErrorsExample.abi,
          to: contractAddress!,
          functionName: 'revertWrite',
        },
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
      ],
      experimental_fallback: true,
    })

    {
      const status = await getCallsStatus(client, response)
      expect(status).toMatchInlineSnapshot(`
        {
          "atomic": false,
          "chainId": 1,
          "receipts": [],
          "status": "pending",
          "statusCode": 100,
          "version": "2.0.0",
        }
      `)
    }

    await mine(client, { blocks: 2 })

    {
      const { receipts, ...rest } = await getCallsStatus(client, response)
      expect(receipts!.length).toBe(2)
      expect(rest).toMatchInlineSnapshot(`
        {
          "atomic": false,
          "chainId": 1,
          "status": "failure",
          "statusCode": 600,
          "version": "2.0.0",
        }
      `)
    }
  })
})
