import { accounts, localHttpUrl } from '../../_test/constants.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { withJsonRpcAccount } from './withJsonRpcAccount.js'
import { expect, test } from 'vitest'

test('getAddresses', async () => {
  const walletClient = createWalletClient({
    transport: http(localHttpUrl),
  })
  const {
    uid: _1,
    transport: _2,
    ...client_1
  } = await withJsonRpcAccount(walletClient)
  expect(client_1).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "json-rpc",
      },
      "addChain": [Function],
      "batch": undefined,
      "chain": undefined,
      "deployContract": [Function],
      "extend": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "key": "wallet",
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "request": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "switchChain": [Function],
      "type": "walletClient",
      "watchAsset": [Function],
      "withJsonRpcAccount": [Function],
      "writeContract": [Function],
    }
  `)

  const client_2 = await withJsonRpcAccount(walletClient, { index: 2 })
  expect(client_2.account.address.toLowerCase()).toEqual(accounts[2].address)
})

test('requestAddresses', async () => {
  const walletClient = createWalletClient({
    transport: http(localHttpUrl),
  })
  const {
    uid: _1,
    transport: _2,
    ...client_1
  } = await withJsonRpcAccount(walletClient, { method: 'request' })
  expect(client_1).toMatchInlineSnapshot(`
    {
      "account": {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "json-rpc",
      },
      "addChain": [Function],
      "batch": undefined,
      "chain": undefined,
      "deployContract": [Function],
      "extend": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "key": "wallet",
      "name": "Wallet Client",
      "pollingInterval": 4000,
      "request": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "switchChain": [Function],
      "type": "walletClient",
      "watchAsset": [Function],
      "withJsonRpcAccount": [Function],
      "writeContract": [Function],
    }
  `)

  const client_2 = await withJsonRpcAccount(walletClient, {
    index: 2,
    method: 'request',
  })
  expect(client_2.account.address.toLowerCase()).toEqual(accounts[2].address)
})
