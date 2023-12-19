---
head:
  - - meta
    - property: og:title
      content: Migration Guide
  - - meta
    - name: description
      content: Guide to migrate to newer versions of viem.
  - - meta
    - property: og:description
      content: Guide to migrate to newer versions of viem.
---

# Migration Guide

If you are coming from an earlier version of `viem`, you will need to make sure to update the following APIs listed below.

## 1.x.x Breaking changes

The 1.x.x release only includes very minor changes to the behavior in event log decoding, and removes the redundant ethers.js Wallet Adapter. If you do not directly use these APIs, you do not need to update any of your code for this version.

### Removed `ethersWalletToAccount`

The `ethersWalletToAccount` adapter has been removed.

This adapter was introduced when viem did not have Private Key & HD Accounts. Since 0.2, viem provides all the utilities needed to create and import [Private Key](https://viem.sh/docs/accounts/privateKey.html) & [HD Accounts](https://viem.sh/docs/accounts/mnemonic.html).

If you still need it, you can copy + paste the [old implementation](https://github.com/wevm/viem/blob/a9a71507032db896295fa1f3fa2dd6c2bdc85137/src/adapters/ethers.ts).

### `logIndex` & `transactionIndex` on Logs

`logIndex` & `transactionIndex` on `Log` now return a `number` instead of a `bigint`.

```ts
const log: Log = {
  ...
  logIndex: 1n, // [!code --]
  logIndex: 1, // [!code ++]
  transactionIndex: 1n, // [!code --]
  transactionIndex: 1, // [!code ++]
  ...
}
```

### Minor: `decodeEventLog` behavior change

`decodeEventLog` no longer attempts to partially decode events. If the Log does not conform to the ABI (mismatch between the number of indexed/non-indexed arguments to topics/data), it will throw an error. 

For example, the following Log will throw an error as there is a mismatch in non-`indexed` arguments & `data` length.

```ts {2-4}
decodeEventLog({
  abi: parseAbi(['event Transfer(address indexed, address, uint256)']),
  // `data` should be 64 bytes, but is only 32 bytes.
  data: '0x0000000000000000000000000000000000000000000000000000000000000001'
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  ]
})
```

Previously, the above would only decode the `indexed` arguments. 

If you would like to partially decode event logs (previous behavior), you can turn off `strict` mode:

```ts 
decodeEventLog({
  abi: parseAbi(['event Transfer(address indexed, address, uint256)']),
  data: '0x0000000000000000000000000000000000000000000000000000000000000001'
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  ],
  strict: false // [!code ++]
})
```

## 0.3.x Breaking changes

The 0.3.x release only includes breaking changes around RPC errors. If you do not directly use the APIs listed below, you do not need to update any of your code for this version.

### Renamed `RequestError` to `RpcError`

`RequestError` was renamed `RpcError` for clarity.

```ts
import { RequestError } from 'viem'  // [!code --]
import { RpcError } from 'viem'  // [!code ++]

throw new RequestError(new Error('An error occurred.'))  // [!code --]
throw new RpcError(new Error('An error occurred.'))  // [!code ++]
```

### Removed `RpcRequestError`

`RpcRequestError` was removed. Use `RpcError` instead.

```ts
import { RpcRequestError } from 'viem' // [!code --]
import { RpcError } from 'viem'  // [!code ++]

throw new RpcRequestError(new Error('An error occurred.')) // [!code --]
throw new RpcError(new Error('An error occurred.')) // [!code ++]
```

### Renamed `RpcError` to `RpcRequestError`

`RpcError` was renamed `RpcRequestError` for consistency.

```ts
import { RpcError } from 'viem' // [!code --]
import { RpcRequestError } from 'viem'  // [!code ++]

const err = new RpcError({ // [!code --]
const err = new RpcRequestError({  // [!code ++]
  body: { foo: 'bar' },
  error: { code: 420, message: 'Error' },
  url: 'https://example-rpc.com',
})
```

## 0.2.x Breaking changes

### `chain` is required for `sendTransaction`, `writeContract`, `deployContract`

A chain is now required for the `sendTransaction`, `writeContract`, `deployContract` Actions.

You can hoist the Chain on the Client:

```ts
import { createWalletClient, custom, getAccount } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet, // [!code ++]
  transport: custom(window.ethereum)
})
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ 
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

Alternatively, you can pass the Chain directly to the Action:

```ts
import { createWalletClient, custom, getAccount } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet, // [!code --]
  transport: custom(window.ethereum)
})
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ 
  account,
  chain: mainnet, // [!code ++]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### `recoverAddress`, `recoverMessageAddress`, `verifyMessage` are now async

he following functions are now `async` functions instead of synchronous functions:

- `recoverAddress`
- `recoverMessageAddress`
- `verifyMessage`

```ts
import { recoverMessageAddress } from 'viem'

recoverMessageAddress({ message: 'hello world', signature: '0x...' }) // [!code --]
await recoverMessageAddress({ message: 'hello world', signature: '0x...' }) // [!code ++]
```

### `assertChain` removed from `sendTransaction`

Removed `assertChain` argument on `sendTransaction`, `writeContract` & `deployContract`. If you wish to bypass the chain check (not recommended unless for testing purposes), you can pass `chain: null`.

```ts
await walletClient.sendTransaction({
  assertChain: false, // [!code --]
  chain: null, // [!code ++]
  ...
})
```

### `getAccount` removed

Removed the `getAccount` function.

#### For JSON-RPC Accounts, use the address itself.

You can now pass the address directly to the `account` option.

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const address = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

const client = createWalletClient({
  account: getAccount(address), // [!code --]
  account: address, // [!code ++]
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

#### For Ethers Wallet Adapter, use `ethersWalletToAccount`.

If you were using the Ethers Wallet adapter, you can use the `ethersWalletToAccount` function.

> Note: viem 0.2.0 now has a [Private Key](/docs/accounts/privateKey.html) & [Mnemonic Account](/docs/accounts/mnemonic.html) implementation. You probably do not need this adapter anymore. This adapter may be removed in a future version.

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { getAccount } from 'viem/ethers' // [!code --]
import { ethersWalletToAccount } from 'viem/ethers' // [!code ++]
import { Wallet } from 'ethers'

const account = getAccount(new Wallet('0x...')) // [!code --]
const account = ethersWalletToAccount(new Wallet('0x...')) // [!code ++]

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

#### For Local Accounts, use `toAccount`.

If you are using a custom signing implementation, you can use the `toAccount` function.

```ts
import { createWalletClient, http, getAccount } from 'viem' // [!code --]
import { createWalletClient, http } from 'viem' // [!code ++]
import { toAccount } from 'viem/accounts' // [!code ++]
import { mainnet } from 'viem/chains'
import { getAddress, signMessage, signTransaction } from './sign-utils' 

const privateKey = '0x...' 
const account = getAccount({ // [!code --]
const account = toAccount({ // [!code ++]
  address: getAddress(privateKey),
  signMessage(message) {
    return signMessage(message, privateKey)
  },
  signTransaction(transaction) {
    return signTransaction(transaction, privateKey)
  },
  signTypedData(typedData) {
    return signTypedData(typedData, privateKey)
  }
})

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```

### `data` renamed in `signMessage`

Renamed the `data` parameter in `signMessage` to `message`.

```ts
walletClient.signMessage({
  data: 'hello world', // [!code --]
  message: 'hello world', // [!code ++]
})
```
