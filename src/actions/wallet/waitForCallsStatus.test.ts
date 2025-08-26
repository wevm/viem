import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { BundleFailedError } from '../../errors/calls.js'
import { RpcRequestError } from '../../errors/request.js'
import type {
  WalletCallReceipt,
  WalletGetCallsStatusReturnType,
} from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import { getHttpRpcClient, parseEther } from '../../utils/index.js'
import { uid } from '../../utils/uid.js'
import { mine } from '../index.js'
import { sendCalls } from './sendCalls.js'
import { waitForCallsStatus } from './waitForCallsStatus.js'

const testClient = anvilMainnet.getClient()

type Uid = string
type TxHashes = Hex[]
const calls = new Map<Uid, TxHashes>()

const getClient = ({
  onRequest,
}: {
  onRequest?: ({ method, params }: any) => void
} = {}) =>
  createClient({
    pollingInterval: 100,
    transport: custom({
      async request({ method, params }) {
        onRequest?.({ method, params })

        const rpcClient = getHttpRpcClient(anvilMainnet.rpcUrl.http)

        if (method === 'wallet_getCallsStatus') {
          const hashes = calls.get(params[0])
          if (!hashes)
            return {
              atomic: false,
              chainId: '0x1',
              id: params[0],
              receipts: [],
              status: 100,
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

  const {
    id: id_,
    receipts,
    ...rest
  } = await waitForCallsStatus(client, {
    id,
  })
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

test('behavior: timeout exceeded', async () => {
  const client = getClient()

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

  await expect(() =>
    waitForCallsStatus(client, {
      id,
    }),
  ).rejects.toThrowError('RPC Request failed.')
})

test('behavior: throwOnFailure = true with failed bundle', async () => {
  const client = createClient({
    pollingInterval: 100,
    transport: custom({
      async request({ params }) {
        return {
          atomic: false,
          chainId: '0x1',
          id: params[0],
          receipts: [],
          status: 400,
          version: '2.0.0',
        } satisfies WalletGetCallsStatusReturnType
      },
    }),
  })

  try {
    await waitForCallsStatus(client, {
      id: 'test-bundle-id',
      throwOnFailure: true,
    })
  } catch (e) {
    const error = e as BundleFailedError
    expect(error).toBeInstanceOf(BundleFailedError)
    expect((error as BundleFailedError).name).toBe('BundleFailedError')
    expect((error as BundleFailedError).result.status).toBe('failure')
    expect((error as BundleFailedError).result.statusCode).toBe(400)
  }
})

test('behavior: throwOnFailure = false with failed bundle (default)', async () => {
  const client = createClient({
    pollingInterval: 100,
    transport: custom({
      async request({ params }) {
        return {
          atomic: false,
          chainId: '0x1',
          id: params[0],
          receipts: [],
          status: 400,
          version: '2.0.0',
        } satisfies WalletGetCallsStatusReturnType
      },
    }),
  })

  const id = 'test-bundle-id'

  // Should not throw by default (throwOnFailure = false)
  const result = await waitForCallsStatus(client, {
    id,
  })

  expect(result.status).toBe('failure')
  expect(result.statusCode).toBe(400)
  expect(result.id).toBe(id)
})

test('behavior: throwOnFailure = false explicitly with failed bundle', async () => {
  const client = createClient({
    pollingInterval: 100,
    transport: custom({
      async request({ params }) {
        return {
          atomic: false,
          chainId: '0x1',
          id: params[0],
          receipts: [],
          status: 500,
          version: '2.0.0',
        } satisfies WalletGetCallsStatusReturnType
      },
    }),
  })

  const id = 'test-bundle-id'

  const result = await waitForCallsStatus(client, {
    id,
    throwOnFailure: false,
  })

  expect(result.status).toBe('failure')
  expect(result.statusCode).toBe(500)
  expect(result.id).toBe(id)
})

test('behavior: throwOnFailure = true with successful bundle', async () => {
  const client = getClient()

  const { id } = await sendCalls(client, {
    account: accounts[0].address,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
    ],
    chain: mainnet,
  })

  expect(id).toBeDefined()

  await mine(testClient, { blocks: 1 })

  const result = await waitForCallsStatus(client, {
    id,
    throwOnFailure: true,
  })

  expect(result.status).toBe('success')
  expect(result.statusCode).toBe(200)
})
