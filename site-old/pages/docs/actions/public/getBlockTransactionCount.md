---
description: Returns the number of Transactions at a block number, hash or tag.
---

# getBlockTransactionCount

Returns the number of Transactions at a block number, hash or tag.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const count = await publicClient.getBlockTransactionCount() // [!code focus:99]
// @log: Output: 23
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

`number`

The block transaction count.

## Parameters

### blockHash (optional)

- **Type:** [`Hash`](/docs/glossary/types#hash)

Count at a given block hash.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const count = await publicClient.getBlockTransactionCount({
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d' // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

Count at a given block number.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const block = await publicClient.getBlockTransactionCount({
  blockNumber: 42069n // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Count at a given block tag.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const block = await publicClient.getBlockTransactionCount({
  blockTag: 'safe' // [!code focus]
})
```

## JSON-RPC Method

- Calls [`eth_getBlockTransactionCountByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber) for `blockNumber` & `blockTag`.
- Calls [`eth_getBlockTransactionCountByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash) for `blockHash`.