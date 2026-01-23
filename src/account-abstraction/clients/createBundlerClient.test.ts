import { expect, test } from 'vitest'
import { bundlerMainnet } from '~test/bundler.js'
import { mainnet } from '../../chains/index.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { createBundlerClient } from './createBundlerClient.js'

test('creates', () => {
  const { uid, transport, ...client } = createBundlerClient({
    transport: http(bundlerMainnet.rpcUrl.http),
  })

  expect(uid).toBeDefined()
  expect(transport).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "batch": undefined,
      "cacheTime": 4000,
      "ccipRead": undefined,
      "chain": undefined,
      "client": undefined,
      "dataSuffix": undefined,
      "estimateUserOperationGas": [Function],
      "extend": [Function],
      "getChainId": [Function],
      "getSupportedEntryPoints": [Function],
      "getUserOperation": [Function],
      "getUserOperationReceipt": [Function],
      "key": "bundler",
      "name": "Bundler Client",
      "paymaster": undefined,
      "paymasterContext": undefined,
      "pollingInterval": 4000,
      "prepareUserOperation": [Function],
      "request": [Function],
      "sendUserOperation": [Function],
      "type": "bundlerClient",
      "userOperation": undefined,
      "waitForUserOperationReceipt": [Function],
    }
  `)
})

test('args: dataSuffix (hex)', () => {
  const client = createBundlerClient({
    dataSuffix: '0xdeadbeef',
    transport: http(bundlerMainnet.rpcUrl.http),
  })
  expect(client.dataSuffix).toBe('0xdeadbeef')
})

test('args: dataSuffix (inherited from client)', () => {
  const walletClient = createWalletClient({
    chain: mainnet,
    transport: http(),
    dataSuffix: '0xabcd',
  })
  const bundlerClient = createBundlerClient({
    client: walletClient,
    transport: http(bundlerMainnet.rpcUrl.http),
  })
  expect(bundlerClient.dataSuffix).toBe('0xabcd')
})

test('args: dataSuffix (explicit overrides inherited)', () => {
  const walletClient = createWalletClient({
    chain: mainnet,
    transport: http(),
    dataSuffix: '0xabcd',
  })
  const bundlerClient = createBundlerClient({
    client: walletClient,
    dataSuffix: '0x1234',
    transport: http(bundlerMainnet.rpcUrl.http),
  })
  expect(bundlerClient.dataSuffix).toBe('0x1234')
})

test('smoke', async () => {
  const bundlerClient = createBundlerClient({
    transport: http(bundlerMainnet.rpcUrl.http),
  })

  const chainId = await bundlerClient.request({ method: 'eth_chainId' })

  expect(chainId).toMatchInlineSnapshot(`"0x1"`)
})
