import { expect, test } from 'vitest'
import { bundlerMainnet } from '../../../test/src/bundler.js'
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

test('smoke', async () => {
  const bundlerClient = createBundlerClient({
    transport: http(bundlerMainnet.rpcUrl.http),
  })

  const chainId = await bundlerClient.request({ method: 'eth_chainId' })

  expect(chainId).toMatchInlineSnapshot(`"0x1"`)
})
