import { assertType, describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../test/src/anvil.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import type { JsonRpcAccount, PrivateKeyAccount } from '../accounts/types.js'
import { localhost } from '../chains/index.js'
import type { EIP1193RequestFn, WalletRpcSchema } from '../types/eip1193.js'
import { createWalletClient } from './createWalletClient.js'
import { publicActions } from './decorators/public.js'
import { testActions } from './decorators/test.js'
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
  const { uid, ...client } = createWalletClient({
    transport: mockTransport,
  })

  assertType<EIP1193RequestFn<WalletRpcSchema>>(client.request)
  assertType<{
    account?: undefined
  }>(client)
  expect(uid).toBeDefined()
  expect(client).toMatchInlineSnapshot(`
    {
      "account": undefined,
      "addChain": [Function],
      "batch": undefined,
      "cacheTime": 4000,
      "ccipRead": undefined,
      "chain": undefined,
      "deployContract": [Function],
      "extend": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "key": "wallet",
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "prepareTransactionRequest": [Function],
      "request": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendRawTransaction": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "switchChain": [Function],
      "transport": {
        "key": "mock",
        "name": "Mock Transport",
        "request": [MockFunction spy],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": undefined,
        "type": "mock",
      },
      "type": "walletClient",
      "watchAsset": [Function],
      "writeContract": [Function],
    }
  `)
})

describe('args: account', () => {
  test('json-rpc account', () => {
    const { uid, ...client } = createWalletClient({
      account: accounts[0].address,
      transport: mockTransport,
    })
    assertType<{
      account: JsonRpcAccount
    }>(client)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "type": "json-rpc",
        },
        "addChain": [Function],
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "deployContract": [Function],
        "extend": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendRawTransaction": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "switchChain": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })

  test('local account', () => {
    const { uid, ...client } = createWalletClient({
      account: privateKeyToAccount(accounts[0].privateKey),
      transport: mockTransport,
    })
    assertType<{
      account: PrivateKeyAccount
    }>(client)
    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "experimental_signAuthorization": [Function],
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "addChain": [Function],
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "deployContract": [Function],
        "extend": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendRawTransaction": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "switchChain": [Function],
        "transport": {
          "key": "mock",
          "name": "Mock Transport",
          "request": [MockFunction spy],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "mock",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })
})

describe('args: transport', () => {
  test('custom', () => {
    const { uid, ...client } = createWalletClient({
      transport: custom({ request: async () => null }),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "addChain": [Function],
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "deployContract": [Function],
        "extend": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendRawTransaction": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "switchChain": [Function],
        "transport": {
          "key": "custom",
          "name": "Custom Provider",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": undefined,
          "type": "custom",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })

  test('http', () => {
    const { uid, ...client } = createWalletClient({
      transport: http('https://mockapi.com/rpc'),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "addChain": [Function],
        "batch": undefined,
        "cacheTime": 4000,
        "ccipRead": undefined,
        "chain": undefined,
        "deployContract": [Function],
        "extend": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendRawTransaction": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "switchChain": [Function],
        "transport": {
          "fetchOptions": undefined,
          "key": "http",
          "name": "HTTP JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "timeout": 10000,
          "type": "http",
          "url": "https://mockapi.com/rpc",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })

  test('webSocket', () => {
    const { uid, ...client } = createWalletClient({
      chain: localhost,
      transport: webSocket(anvilMainnet.rpcUrl.ws),
    })

    expect(uid).toBeDefined()
    expect(client).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "addChain": [Function],
        "batch": undefined,
        "cacheTime": 4000,
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
        "deployContract": [Function],
        "extend": [Function],
        "getAddresses": [Function],
        "getChainId": [Function],
        "getPermissions": [Function],
        "key": "wallet",
        "name": "Wallet Client",
        "pollingInterval": 4000,
        "prepareTransactionRequest": [Function],
        "request": [Function],
        "requestAddresses": [Function],
        "requestPermissions": [Function],
        "sendRawTransaction": [Function],
        "sendTransaction": [Function],
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "switchChain": [Function],
        "transport": {
          "getRpcClient": [Function],
          "getSocket": [Function],
          "key": "webSocket",
          "name": "WebSocket JSON-RPC",
          "request": [Function],
          "retryCount": 3,
          "retryDelay": 150,
          "subscribe": [Function],
          "timeout": 10000,
          "type": "webSocket",
        },
        "type": "walletClient",
        "watchAsset": [Function],
        "writeContract": [Function],
      }
    `)
  })
})

test('extend', () => {
  const { uid: _, ...client } = createWalletClient({
    account: accounts[0].address,
    chain: localhost,
    transport: http(),
  })
    .extend(publicActions)
    .extend(testActions({ mode: 'anvil' }))

  expect(client).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      },
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
      "key": "wallet",
      "loadState": [Function],
      "mine": [Function],
      "multicall": [Function],
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "prepareTransactionRequest": [Function],
      "readContract": [Function],
      "removeBlockTimestampInterval": [Function],
      "request": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "reset": [Function],
      "revert": [Function],
      "sendRawTransaction": [Function],
      "sendTransaction": [Function],
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
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "simulateContract": [Function],
      "snapshot": [Function],
      "stopImpersonatingAccount": [Function],
      "switchChain": [Function],
      "transport": {
        "fetchOptions": undefined,
        "key": "http",
        "name": "HTTP JSON-RPC",
        "request": [Function],
        "retryCount": 3,
        "retryDelay": 150,
        "timeout": 10000,
        "type": "http",
        "url": "http://127.0.0.1:8545",
      },
      "type": "walletClient",
      "uninstallFilter": [Function],
      "verifyMessage": [Function],
      "verifySiweMessage": [Function],
      "verifyTypedData": [Function],
      "waitForTransactionReceipt": [Function],
      "watchAsset": [Function],
      "watchBlockNumber": [Function],
      "watchBlocks": [Function],
      "watchContractEvent": [Function],
      "watchEvent": [Function],
      "watchPendingTransactions": [Function],
      "writeContract": [Function],
    }
  `)
})
