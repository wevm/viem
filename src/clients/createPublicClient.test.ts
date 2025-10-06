import { assertType, describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../test/src/anvil.js'
import { localhost } from '../chains/index.js'
import type { EIP1193RequestFn, PublicRpcSchema } from '../index.js'
import * as utilsRpcWebSocket from '../utils/rpc/webSocket.js'
import { createPublicClient } from './createPublicClient.js'
import { testActions } from './decorators/test.js'
import { walletActions } from './decorators/wallet.js'
import { createTransport } from './transports/createTransport.js'
import { custom } from './transports/custom.js'
import { http } from './transports/http.js'
import { webSocket } from './transports/webSocket.js'

const mockTransport = () =>
  createTransport({
    key: 'mock',
    name: 'Mock Transport',
    request: vi.fn(() => null) as any,
    type: 'mock',
  })

test('creates', () => {
  const { uid, ...client } = createPublicClient({
    transport: mockTransport,
  })

  assertType<EIP1193RequestFn<PublicRpcSchema>>(client.request)

  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "batch": undefined,
      "cacheTime": 4000,
      "call": [Function],
      "ccipRead": undefined,
      "chain": undefined,
      "createAccessList": [Function],
      "createBlockFilter": [Function],
      "createContractEventFilter": [Function],
      "createEventFilter": [Function],
      "createPendingTransactionFilter": [Function],
      "estimateContractGas": [Function],
      "estimateFeesPerGas": [Function],
      "estimateGas": [Function],
      "estimateMaxPriorityFeePerGas": [Function],
      "extend": [Function],
      "getBalance": [Function],
      "getBlobBaseFee": [Function],
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockTransactionCount": [Function],
      "getBytecode": [Function],
      "getChainId": [Function],
      "getCode": [Function],
      "getContractEvents": [Function],
      "getEip712Domain": [Function],
      "getEnsAddress": [Function],
      "getEnsAvatar": [Function],
      "getEnsName": [Function],
      "getEnsResolver": [Function],
      "getEnsText": [Function],
      "getFeeHistory": [Function],
      "getFilterChanges": [Function],
      "getFilterLogs": [Function],
      "getGasPrice": [Function],
      "getLogs": [Function],
      "getProof": [Function],
      "getStorageAt": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "key": "public",
      "multicall": [Function],
      "name": "Public Client",
      "pollingInterval": 4000,
      "prepareTransactionRequest": [Function],
      "readContract": [Function],
      "request": [Function],
      "sendRawTransaction": [Function],
      "sendRawTransactionSync": [Function],
      "simulate": [Function],
      "simulateBlocks": [Function],
      "simulateCalls": [Function],
      "simulateContract": [Function],
      "transport": {
        "key": "mock",
        "methods": undefined,
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "type": "publicClient",
      "uninstallFilter": [Function],
      "verifyHash": [Function],
      "verifyMessage": [Function],
      "verifySiweMessage": [Function],
      "verifyTypedData": [Function],
      "waitForTransactionReceipt": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchContractEvent": [Function],
      "watchEvent": [Function],
      "watchPendingTransactions": [Function],
    }
  `)
})

test('args: batch', () => {
  expect(
    createPublicClient({
      batch: {
        multicall: true,
      },
      chain: localhost,
      transport: http(),
    }).batch,
  ).toMatchInlineSnapshot(`
    {
      "multicall": true,
    }
  `)

  expect(
    createPublicClient({
      batch: {
        multicall: {
          batchSize: 2048,
          wait: 32,
        },
      },
      chain: localhost,
      transport: http(),
    }).batch,
  ).toMatchInlineSnapshot(`
    {
      "multicall": {
        "batchSize": 2048,
        "wait": 32,
      },
    }
  `)
})

describe('transports', () => {
  test('http', () => {
    const { uid, ...client } = createPublicClient({
      chain: localhost,
      transport: http(),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "call": [Function],
        "ccipRead": undefined,
        "chain": {
          "fees": undefined,
          "formatters": undefined,
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
          "serializers": undefined,
        },
        "createAccessList": [Function],
        "createBlockFilter": [Function],
        "createContractEventFilter": [Function],
        "createEventFilter": [Function],
        "createPendingTransactionFilter": [Function],
        "estimateContractGas": [Function],
        "estimateFeesPerGas": [Function],
        "estimateGas": [Function],
        "estimateMaxPriorityFeePerGas": [Function],
        "extend": [Function],
        "getBalance": [Function],
        "getBlobBaseFee": [Function],
        "getBlock": [Function],
        "getBlockNumber": [Function],
        "getBlockTransactionCount": [Function],
        "getBytecode": [Function],
        "getChainId": [Function],
        "getCode": [Function],
        "getContractEvents": [Function],
        "getEip712Domain": [Function],
        "getEnsAddress": [Function],
        "getEnsAvatar": [Function],
        "getEnsName": [Function],
        "getEnsResolver": [Function],
        "getEnsText": [Function],
        "getFeeHistory": [Function],
        "getFilterChanges": [Function],
        "getFilterLogs": [Function],
        "getGasPrice": [Function],
        "getLogs": [Function],
        "getProof": [Function],
        "getStorageAt": [Function],
        "getTransaction": [Function],
        "getTransactionConfirmations": [Function],
        "getTransactionCount": [Function],
        "getTransactionReceipt": [Function],
        "key": "public",
        "multicall": [Function],
        "name": "Public Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "readContract": [Function],
        "request": [Function],
        "sendRawTransaction": [Function],
        "sendRawTransactionSync": [Function],
        "simulate": [Function],
        "simulateBlocks": [Function],
        "simulateCalls": [Function],
        "simulateContract": [Function],
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "methods": undefined,
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "http://127.0.0.1:8545",
        },
        "type": "publicClient",
        "uninstallFilter": [Function],
        "verifyHash": [Function],
        "verifyMessage": [Function],
        "verifySiweMessage": [Function],
        "verifyTypedData": [Function],
        "waitForTransactionReceipt": [Function],
        "watchBlockNumber": [Function],
        "watchBlocks": [Function],
        "watchContractEvent": [Function],
        "watchEvent": [Function],
        "watchPendingTransactions": [Function],
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createPublicClient({
      chain: localhost,
      transport: webSocket(anvilMainnet.rpcUrl.ws),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "call": [Function],
        "ccipRead": undefined,
        "chain": {
          "fees": undefined,
          "formatters": undefined,
          "id": 1337,
          "name": "Localhost",
          "nativeCurrency": {
            "decimals": 18,
            "name": "Ether",
            "symbol": "ETH",
          },
          "rpcUrls": {
            "default": {
              "http": [
                "http://127.0.0.1:8545",
              ],
            },
          },
          "serializers": undefined,
        },
        "createAccessList": [Function],
        "createBlockFilter": [Function],
        "createContractEventFilter": [Function],
        "createEventFilter": [Function],
        "createPendingTransactionFilter": [Function],
        "estimateContractGas": [Function],
        "estimateFeesPerGas": [Function],
        "estimateGas": [Function],
        "estimateMaxPriorityFeePerGas": [Function],
        "extend": [Function],
        "getBalance": [Function],
        "getBlobBaseFee": [Function],
        "getBlock": [Function],
        "getBlockNumber": [Function],
        "getBlockTransactionCount": [Function],
        "getBytecode": [Function],
        "getChainId": [Function],
        "getCode": [Function],
        "getContractEvents": [Function],
        "getEip712Domain": [Function],
        "getEnsAddress": [Function],
        "getEnsAvatar": [Function],
        "getEnsName": [Function],
        "getEnsResolver": [Function],
        "getEnsText": [Function],
        "getFeeHistory": [Function],
        "getFilterChanges": [Function],
        "getFilterLogs": [Function],
        "getGasPrice": [Function],
        "getLogs": [Function],
        "getProof": [Function],
        "getStorageAt": [Function],
        "getTransaction": [Function],
        "getTransactionConfirmations": [Function],
        "getTransactionCount": [Function],
        "getTransactionReceipt": [Function],
        "key": "public",
        "multicall": [Function],
        "name": "Public Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "readContract": [Function],
        "request": [Function],
        "sendRawTransaction": [Function],
        "sendRawTransactionSync": [Function],
        "simulate": [Function],
        "simulateBlocks": [Function],
        "simulateCalls": [Function],
        "simulateContract": [Function],
        "transport": {
          "getRpcClient": [Function],
          "getSocket": [Function],
          "key": "webSocket",
          "methods": undefined,
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "subscribe": [Function],
          "timeout": 10000,
          "type": "webSocket",
        },
        "type": "publicClient",
        "uninstallFilter": [Function],
        "verifyHash": [Function],
        "verifyMessage": [Function],
        "verifySiweMessage": [Function],
        "verifyTypedData": [Function],
        "waitForTransactionReceipt": [Function],
        "watchBlockNumber": [Function],
        "watchBlocks": [Function],
        "watchContractEvent": [Function],
        "watchEvent": [Function],
        "watchPendingTransactions": [Function],
      }
    `)
  })

  test('webSocket - getRpcClient() - keepAlive & reconnect disabled', async () => {
    const wsRpcClientOpts = { keepAlive: false, reconnect: false }
    const { uid: _, ...client } = createPublicClient({
      chain: localhost,
      transport: webSocket(anvilMainnet.rpcUrl.ws, wsRpcClientOpts),
    })
    const spy = vi.spyOn(utilsRpcWebSocket, 'getWebSocketRpcClient')

    await client.transport.getRpcClient()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(anvilMainnet.rpcUrl.ws, wsRpcClientOpts)
  })

  test('webSocket - subscribe() - keepAlive & reconnect disabled', async () => {
    const wsRpcClientOpts = { keepAlive: false, reconnect: false }
    const { uid: _, ...client } = createPublicClient({
      chain: localhost,
      transport: webSocket(anvilMainnet.rpcUrl.ws, wsRpcClientOpts),
    })
    const spy = vi.spyOn(utilsRpcWebSocket, 'getWebSocketRpcClient')

    await client.transport.subscribe({
      params: ['newHeads'],
      onData: () => {},
      onError: () => {},
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(anvilMainnet.rpcUrl.ws, wsRpcClientOpts)
  })

  test('webSocket - request() - keepAlive & reconnect disabled', async () => {
    const wsRpcClientOpts = { keepAlive: false, reconnect: false }
    const { uid: _, ...client } = createPublicClient({
      chain: localhost,
      transport: webSocket(anvilMainnet.rpcUrl.ws, wsRpcClientOpts),
    })
    const spy = vi.spyOn(utilsRpcWebSocket, 'getWebSocketRpcClient')

    await client.transport.request({ method: 'eth_blockNumber', params: [] })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(anvilMainnet.rpcUrl.ws, wsRpcClientOpts)
  })

  test('custom', () => {
    const { uid, ...client } = createPublicClient({
      transport: custom({ request: async () => null }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "batch": undefined,
        "cacheTime": 4000,
        "call": [Function],
        "ccipRead": undefined,
        "chain": undefined,
        "createAccessList": [Function],
        "createBlockFilter": [Function],
        "createContractEventFilter": [Function],
        "createEventFilter": [Function],
        "createPendingTransactionFilter": [Function],
        "estimateContractGas": [Function],
        "estimateFeesPerGas": [Function],
        "estimateGas": [Function],
        "estimateMaxPriorityFeePerGas": [Function],
        "extend": [Function],
        "getBalance": [Function],
        "getBlobBaseFee": [Function],
        "getBlock": [Function],
        "getBlockNumber": [Function],
        "getBlockTransactionCount": [Function],
        "getBytecode": [Function],
        "getChainId": [Function],
        "getCode": [Function],
        "getContractEvents": [Function],
        "getEip712Domain": [Function],
        "getEnsAddress": [Function],
        "getEnsAvatar": [Function],
        "getEnsName": [Function],
        "getEnsResolver": [Function],
        "getEnsText": [Function],
        "getFeeHistory": [Function],
        "getFilterChanges": [Function],
        "getFilterLogs": [Function],
        "getGasPrice": [Function],
        "getLogs": [Function],
        "getProof": [Function],
        "getStorageAt": [Function],
        "getTransaction": [Function],
        "getTransactionConfirmations": [Function],
        "getTransactionCount": [Function],
        "getTransactionReceipt": [Function],
        "key": "public",
        "multicall": [Function],
        "name": "Public Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "readContract": [Function],
        "request": [Function],
        "sendRawTransaction": [Function],
        "sendRawTransactionSync": [Function],
        "simulate": [Function],
        "simulateBlocks": [Function],
        "simulateCalls": [Function],
        "simulateContract": [Function],
        "transport": {
          "key": "custom",
          "methods": undefined,
          "name": "Custom Provider",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "type": "publicClient",
        "uninstallFilter": [Function],
        "verifyHash": [Function],
        "verifyMessage": [Function],
        "verifySiweMessage": [Function],
        "verifyTypedData": [Function],
        "waitForTransactionReceipt": [Function],
        "watchBlockNumber": [Function],
        "watchBlocks": [Function],
        "watchContractEvent": [Function],
        "watchEvent": [Function],
        "watchPendingTransactions": [Function],
      }
    `)
  })
})

test('extend', () => {
  const { uid: _, ...client } = createPublicClient({
    chain: localhost,
    transport: http(),
  })
    .extend(walletActions)
    .extend(testActions({ mode: 'anvil' }))

  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "addChain": [Function],
      "batch": undefined,
      "cacheTime": 4000,
      "call": [Function],
      "ccipRead": undefined,
      "chain": {
        "fees": undefined,
        "formatters": undefined,
        "id": 1337,
        "name": "Localhost",
        "nativeCurrency": {
          "decimals": 18,
          "name": "Ether",
          "symbol": "ETH",
        },
        "rpcUrls": {
          "default": {
            "http": [
              "http://127.0.0.1:8545",
            ],
          },
        },
        "serializers": undefined,
      },
      "createAccessList": [Function],
      "createBlockFilter": [Function],
      "createContractEventFilter": [Function],
      "createEventFilter": [Function],
      "createPendingTransactionFilter": [Function],
      "deployContract": [Function],
      "dropTransaction": [Function],
      "dumpState": [Function],
      "estimateContractGas": [Function],
      "estimateFeesPerGas": [Function],
      "estimateGas": [Function],
      "estimateMaxPriorityFeePerGas": [Function],
      "extend": [Function],
      "getAddresses": [Function],
      "getAutomine": [Function],
      "getBalance": [Function],
      "getBlobBaseFee": [Function],
      "getBlock": [Function],
      "getBlockNumber": [Function],
      "getBlockTransactionCount": [Function],
      "getBytecode": [Function],
      "getCallsStatus": [Function],
      "getCapabilities": [Function],
      "getChainId": [Function],
      "getCode": [Function],
      "getContractEvents": [Function],
      "getEip712Domain": [Function],
      "getEnsAddress": [Function],
      "getEnsAvatar": [Function],
      "getEnsName": [Function],
      "getEnsResolver": [Function],
      "getEnsText": [Function],
      "getFeeHistory": [Function],
      "getFilterChanges": [Function],
      "getFilterLogs": [Function],
      "getGasPrice": [Function],
      "getLogs": [Function],
      "getPermissions": [Function],
      "getProof": [Function],
      "getStorageAt": [Function],
      "getTransaction": [Function],
      "getTransactionConfirmations": [Function],
      "getTransactionCount": [Function],
      "getTransactionReceipt": [Function],
      "getTxpoolContent": [Function],
      "getTxpoolStatus": [Function],
      "impersonateAccount": [Function],
      "increaseTime": [Function],
      "inspectTxpool": [Function],
      "key": "public",
      "loadState": [Function],
      "mine": [Function],
      "multicall": [Function],
      "name": "Public Client",
      "pollingInterval": 4000,
      "prepareAuthorization": [Function],
      "prepareTransactionRequest": [Function],
      "readContract": [Function],
      "removeBlockTimestampInterval": [Function],
      "request": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "reset": [Function],
      "revert": [Function],
      "sendCalls": [Function],
      "sendCallsSync": [Function],
      "sendRawTransaction": [Function],
      "sendRawTransactionSync": [Function],
      "sendTransaction": [Function],
      "sendTransactionSync": [Function],
      "sendUnsignedTransaction": [Function],
      "setAutomine": [Function],
      "setBalance": [Function],
      "setBlockGasLimit": [Function],
      "setBlockTimestampInterval": [Function],
      "setCode": [Function],
      "setCoinbase": [Function],
      "setIntervalMining": [Function],
      "setLoggingEnabled": [Function],
      "setMinGasPrice": [Function],
      "setNextBlockBaseFeePerGas": [Function],
      "setNextBlockTimestamp": [Function],
      "setNonce": [Function],
      "setRpcUrl": [Function],
      "setStorageAt": [Function],
      "showCallsStatus": [Function],
      "signAuthorization": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "simulate": [Function],
      "simulateBlocks": [Function],
      "simulateCalls": [Function],
      "simulateContract": [Function],
      "snapshot": [Function],
      "stopImpersonatingAccount": [Function],
      "switchChain": [Function],
      "transport": {
        "fetchOptions": undefined,
        "key": "http",
        "methods": undefined,
        "name": "HTTP JSON-RPC",
        "request": [Function],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": 10000,
        "type": "http",
        "url": "http://127.0.0.1:8545",
      },
      "type": "publicClient",
      "uninstallFilter": [Function],
      "verifyHash": [Function],
      "verifyMessage": [Function],
      "verifySiweMessage": [Function],
      "verifyTypedData": [Function],
      "waitForCallsStatus": [Function],
      "waitForTransactionReceipt": [Function],
      "watchAsset": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchContractEvent": [Function],
      "watchEvent": [Function],
      "watchPendingTransactions": [Function],
      "writeContract": [Function],
      "writeContractSync": [Function],
    }
  `)
})
