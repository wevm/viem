---
description: Returns the balance of an address in wei.
---

# getBalance

Returns the balance of an address in wei.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const balance = await publicClient.getBalance({ // [!code focus:4]
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
})
// @log: > 10000000000000000000000n (wei)
```

```ts twoslash [client.ts] filename="client.ts"
// [!include ~/snippets/publicClient.ts]
```

:::

## Returns

`bigint`

The balance of the address in wei.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The address of the account.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

The balance of the account at a block number.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 69420n  // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

The balance of the account at a block tag.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'  // [!code focus]
})
```

### blockHash (optional)

- **Type:** `Hash`

The balance of the account at a block hash. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const balance = await publicClient.getBalance({
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
const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
  requireCanonical: true  // [!code focus]
})
```

## Tips

- You can convert the balance to ether units with [`formatEther`](/docs/utilities/formatEther).

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { formatEther } from 'viem' // [!code focus]

const balance = await publicClient.getBalance({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe'
})
const balanceAsEther = formatEther(balance) // [!code focus:2]
// "6.942"
```

## JSON-RPC Method

[`eth_getBalance`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
