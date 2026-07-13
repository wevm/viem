---
description: Returns a collection of historical gas information.
---

# getFeeHistory

Returns a collection of historical gas information.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const feeHistory = await publicClient.getFeeHistory({ // [!code focus:4]
  blockCount: 4,
  rewardPercentiles: [25, 75]
})
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

[`FeeHistory`](/docs/glossary/types#feehistory)

The fee history.

## Parameters

### blockCount

- **Type:** `number`

Number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const feeHistory = await publicClient.getFeeHistory({
  blockCount: 4, // [!code focus]
  rewardPercentiles: [25, 75]
})
```

### rewardPercentiles

- **Type:** `number[]`

A monotonically increasing list of percentile values to sample from each block's effective priority fees per gas in ascending order, weighted by gas used.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const feeHistory = await publicClient.getFeeHistory({
  blockCount: 4,
  rewardPercentiles: [25, 75] // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

Highest number block of the requested range.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const feeHistory = await publicClient.getFeeHistory({
  blockCount: 4,
  blockNumber: 1551231n, // [!code focus]
  rewardPercentiles: [25, 75]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Highest number block of the requested range.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const feeHistory = await publicClient.getFeeHistory({
  blockCount: 4,
  blockTag: 'safe', // [!code focus]
  rewardPercentiles: [25, 75]
})
```

## JSON-RPC Method

- Calls [`eth_feeHistory`](https://docs.alchemy.com/reference/eth-feehistory).