---
description: Returns the transaction receipts of a block at a block number, hash or tag.
---

# getBlockReceipts

Returns the transaction receipts of a block at a block number, hash or tag.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const receipts = await publicClient.getBlockReceipts({ // [!code focus:99]
  blockNumber: 42069n
})
// @log: [
// @log:   {
// @log:     blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
// @log:     blockNumber: 42069n,
// @log:     from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
// @log:     ...
// @log:     status: 'success',
// @log:   }
// @log: ]
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/publicClient.ts]
```

:::

## Returns

[`TransactionReceipt[]`](/docs/glossary/types#transactionreceipt)

The transaction receipts.

## Parameters

### blockHash (optional)

- **Type:** [`Hash`](/docs/glossary/types#hash)

Receipts at a given block hash.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const receipts = await publicClient.getBlockReceipts({
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d' // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

Receipts at a given block number.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const receipts = await publicClient.getBlockReceipts({
  blockNumber: 42069n // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Receipts at a given block tag.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const receipts = await publicClient.getBlockReceipts({
  blockTag: 'safe' // [!code focus]
})
```

## JSON-RPC Method

[`eth_getBlockReceipts`](https://ethereum.github.io/execution-apis/api/methods/eth_getBlockReceipts/)
