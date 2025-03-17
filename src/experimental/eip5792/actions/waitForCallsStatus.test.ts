import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { mine } from '../../../actions/index.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { RpcRequestError } from '../../../errors/request.js'
import type { WalletCallReceipt } from '../../../types/eip1193.js'
import type { Hex } from '../../../types/misc.js'
import { getHttpRpcClient, parseEther } from '../../../utils/index.js'
import { uid } from '../../../utils/uid.js'
import { sendCalls } from './sendCalls.js'
import { waitForCallsStatus } from './waitForCallsStatus.js'

const testClient = anvilMainnet.getClient()

type Uid = string
type TxHashes = Hex[]
const calls = new Map<Uid, TxHashes>()

const getClient = ({
  onRequest,
}: { onRequest?: ({ method, params }: any) => void } = {}) =>
  createClient({
    pollingInterval: 100,
    transport: custom({
      async request({ method, params }) {
        onRequest?.({ method, params })

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
          const hashes: TxHashes = []
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
          setTimeout(() => {
            calls.set(uid_, hashes)
          }, 1000)
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

  const { status, receipts } = await waitForCallsStatus(client, { id })
  expect(status).toMatchInlineSnapshot(`"CONFIRMED"`)
  expect(receipts!.length).toBe(3)
})

test('behavior: timeout exceeded', async () => {
  const client = getClient()

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

  await expect(() =>
    waitForCallsStatus(client, {
      id,
      timeout: 100,
    }),
  ).rejects.toThrowError('Timed out while waiting for call bundle')
})

test('behavior: `wallet_getCallsStatus` failure', async () => {
  const client = getClient({
    onRequest({ method }) {
      if (method === 'wallet_getCallsStatus') {
        throw new RpcRequestError({
          body: { method, params: [id] },
          error: { code: 1, message: 'test' },
          url: anvilMainnet.rpcUrl.http,
        })
      }
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

  await expect(() =>
    waitForCallsStatus(client, {
      id,
    }),
  ).rejects.toThrowError('RPC Request failed.')
})
