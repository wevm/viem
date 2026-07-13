---
description: Returns the number of Transactions an Account has sent.
---

# getTransactionCount

Returns the number of [Transactions](/docs/glossary/terms#transaction) an Account has broadcast / sent.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const transactionCount = await publicClient.getTransactionCount({  // [!code focus:99]
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
})
// @log: > 420
```

```ts [client.ts] filename="client.ts"
// [!include ~/snippets/publicClient.ts]
```

:::

## Returns

`number`

The number of transactions an account has sent. 

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The address of the account.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transactionCount = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

Get the count at a block number.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transactionCount = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 69420n  // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Get the count at a block tag.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transactionCount = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'  // [!code focus]
})
```

### blockHash (optional)

- **Type:** `Hash`

Get the count at a block hash. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transactionCount = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d'  // [!code focus]
})
```

### requireCanonical (optional)

- **Type:** `boolean`

Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const transactionCount = await publicClient.getTransactionCount({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
  requireCanonical: true  // [!code focus]
})
```

## Notes

- The transaction count of an account can also be used as a nonce.

## JSON-RPC Method

[`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)
