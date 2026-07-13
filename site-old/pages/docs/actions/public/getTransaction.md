---
description: Returns information about a transaction given a hash or block identifier.
---

# getTransaction

Returns information about a [Transaction](/docs/glossary/terms#transaction) given a hash or block identifier.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const transaction = await publicClient.getTransaction({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
// @log: {
// @log:  blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
// @log:  blockNumber: 15132008n,
// @log:  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
// @log:  ...
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

[`Transaction`](/docs/glossary/types#transaction)

The transaction information.

## Parameters

### hash (optional)

- **Type:** `'0x${string}'`

Get information about a transaction given a transaction hash.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.getTransaction({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

### blockHash (optional)

- **Type:** `'0x${string}'`

Get information about a transaction given a block hash (and index).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.getTransaction({
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d', // [!code focus:2]
  index: 0
})
```

### blockNumber (optional)

- **Type:** `'0x${string}'`

Get information about a transaction given a block number (and index).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.getTransaction({
  blockNumber: 69420n, // [!code focus:2]
  index: 0
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Get information about a transaction given a block tag (and index).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.getTransaction({
  blockTag: 'safe', // [!code focus:2]
  index: 0
})
```

### index (optional)

- **Type:** `number`

An index to be used with a block identifier (number, hash or tag).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transaction = await publicClient.getTransaction({
  blockTag: 'safe',
  index: 0 // [!code focus]
})
```

## Example

Check out the usage of `getTransaction` in the live [Fetching Transactions Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Method

[`eth_getTransactionByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionByHash)
