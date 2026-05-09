---
description: Returns the transaction receipt given a transaction hash.
---

# getTransactionReceipt

Returns the [Transaction Receipt](/docs/glossary/terms#transaction-receipt) given a [Transaction](/docs/glossary/terms#transaction) hash.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const transaction = await publicClient.getTransactionReceipt({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
// @log: {
// @log:  blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
// @log:  blockNumber: 15132008n,
// @log:  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
// @log:  ...
// @log:  status: 'success',
// @log: }
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

[`TransactionReceipt`](/docs/glossary/types#transactionreceipt)

The transaction receipt.

## Parameters

### hash

- **Type:** `'0x${string}'`

A transaction hash.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.getTransactionReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

## Example

Check out the usage of `getTransactionReceipt` in the live [Fetching Transactions Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Method

[`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt)
