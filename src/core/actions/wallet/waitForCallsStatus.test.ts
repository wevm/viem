import * as Provider from 'ox/Provider'
import * as Value from 'ox/Value'
import { expect, test } from 'vitest'
import { Client, custom, http, testActions } from 'viem'
import { mainnet } from 'viem/chains'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { uid } from '../../internal/uid.js'
import { wait } from '../../internal/wait.js'
import { sendCalls } from './sendCalls.js'
import { BundleFailedError, waitForCallsStatus } from './waitForCallsStatus.js'

const calls = new Map<string, `0x${string}`[]>()
const node = http(anvil.mainnet.rpcUrl.http).setup({})
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

function getClient(
  options: {
    onRequest?: (parameters: { method: string; params: any }) => void
  } = {},
) {
  return Client.create({
    pollingInterval: 100,
    transport: custom(
      Provider.from({
        async request({ method, params }: any) {
          options.onRequest?.({ method, params })
          if (method === 'wallet_sendCalls') {
            const hashes: `0x${string}`[] = []
            for (const call of params[0].calls)
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
            const id = uid()
            setTimeout(() => calls.set(id, hashes), 300)
            return id
          }
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
              }
            const receipts = await Promise.all(
              hashes.map((hash) =>
                node.request({
                  method: 'eth_getTransactionReceipt',
                  params: [hash],
                }),
              ),
            )
            return {
              atomic: false,
              chainId: '0x1',
              id: params[0],
              receipts,
              status: 200,
              version: '2.0.0',
            }
          }
          if (method.startsWith('eth_')) return node.request({ method, params })
          return null
        },
      }),
    ),
  })
}

test('default', async () => {
  const client = getClient()
  const { id } = await sendCalls(client, {
    account: constants.accounts[0].address,
    calls: [
      { to: constants.accounts[1].address, value: Value.fromEther('1') },
      { to: constants.accounts[2].address },
      {
        data: '0xcafebabe',
        to: constants.accounts[3].address,
        value: Value.fromEther('100'),
      },
    ],
    chain: mainnet,
  })
  await testClient.block.mine({ blocks: 1 })
  const {
    id: id_,
    receipts,
    ...rest
  } = await waitForCallsStatus(client, { id, timeout: 2_000 })
  expect(id_).toBeDefined()
  expect(receipts).toHaveLength(3)
  expect(rest).toMatchInlineSnapshot(`
    {
      "atomic": false,
      "chainId": 1,
      "status": "success",
      "statusCode": 200,
      "version": "2.0.0",
    }
  `)
})

test('behavior: timeout exceeded', async () => {
  const client = getClient()
  const { id } = await sendCalls(client, {
    account: constants.accounts[0].address,
    calls: [{ to: constants.accounts[1].address, value: Value.fromEther('1') }],
    chain: mainnet,
  })
  await testClient.block.mine({ blocks: 1 })
  await expect(() =>
    waitForCallsStatus(client, { id, timeout: 100 }),
  ).rejects.toThrowError('Timed out while waiting for call bundle')
})

test('behavior: `wallet_getCallsStatus` failure', async () => {
  const client = getClient({
    onRequest({ method }) {
      if (method === 'wallet_getCallsStatus')
        throw new Provider.ProviderRpcError(1, 'test')
    },
  })
  const { id } = await sendCalls(client, {
    account: constants.accounts[0].address,
    calls: [{ to: constants.accounts[1].address, value: Value.fromEther('1') }],
    chain: mainnet,
  })
  await testClient.block.mine({ blocks: 1 })
  await expect(() =>
    waitForCallsStatus(client, { id, retryCount: 0 }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InternalError: test]`,
  )
})

test('behavior: throwOnFailure = true with failed bundle', async () => {
  const client = Client.create({
    pollingInterval: 100,
    transport: custom(
      Provider.from({
        async request({ params }: any) {
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            receipts: [],
            status: 400,
            version: '2.0.0',
          }
        },
      }),
    ),
  })
  await expect(() =>
    waitForCallsStatus(client, { id: 'test-bundle-id', throwOnFailure: true }),
  ).rejects.toBeInstanceOf(BundleFailedError)
})

test('behavior: throwOnFailure = false with failed bundle (default)', async () => {
  const client = Client.create({
    pollingInterval: 100,
    transport: custom(
      Provider.from({
        async request({ params }: any) {
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            receipts: [],
            status: 400,
            version: '2.0.0',
          }
        },
      }),
    ),
  })
  const result = await waitForCallsStatus(client, { id: 'test-bundle-id' })
  expect({
    id: result.id,
    status: result.status,
    statusCode: result.statusCode,
  }).toMatchInlineSnapshot(`
    {
      "id": "test-bundle-id",
      "status": "failure",
      "statusCode": 400,
    }
  `)
})

test('behavior: throwOnFailure = false explicitly with failed bundle', async () => {
  const client = Client.create({
    pollingInterval: 100,
    transport: custom(
      Provider.from({
        async request({ params }: any) {
          return {
            atomic: false,
            chainId: '0x1',
            id: params[0],
            receipts: [],
            status: 500,
            version: '2.0.0',
          }
        },
      }),
    ),
  })
  const result = await waitForCallsStatus(client, {
    id: 'test-bundle-id',
    throwOnFailure: false,
  })
  expect({
    id: result.id,
    status: result.status,
    statusCode: result.statusCode,
  }).toMatchInlineSnapshot(`
    {
      "id": "test-bundle-id",
      "status": "failure",
      "statusCode": 500,
    }
  `)
})

test('behavior: throwOnFailure = true with successful bundle', async () => {
  const client = getClient()
  const { id } = await sendCalls(client, {
    account: constants.accounts[0].address,
    calls: [{ to: constants.accounts[1].address, value: Value.fromEther('1') }],
    chain: mainnet,
  })
  await testClient.block.mine({ blocks: 1 })
  await wait(350)
  const result = await waitForCallsStatus(client, { id, throwOnFailure: true })
  expect({ status: result.status, statusCode: result.statusCode })
    .toMatchInlineSnapshot(`
    {
      "status": "success",
      "statusCode": 200,
    }
  `)
})
