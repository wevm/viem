# getBlockTransactionCount

Returns information about a block at a block number, hash or tag.

## Import

```ts
import { getBlockTransactionCount } from 'viem'
```

## Usage

```ts
import { getBlockTransactionCount } from 'viem'
import { publicClient } from '.'
 
const count = await getBlockTransactionCount(publicClient) // [!code focus:99]
// 23
```

## Returns

`number`

The block transaction count.

## Parameters

### blockHash (optional)

- **Type:** `'0x${string}'`

Count at a given block hash.

```ts
const count = await getBlockTransactionCount(publicClient, {
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d' // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

Count at a given block number.

```ts
const block = await getBlockTransactionCount(publicClient, {
  blockNumber: 42069n // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Count at a given block tag.

```ts
const block = await getBlockTransactionCount(publicClient, {
  blockTag: 'safe' // [!code focus]
})
```