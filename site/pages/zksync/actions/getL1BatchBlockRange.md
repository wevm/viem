---
description: Returns the range of blocks contained within a batch given by batch number.
---

# getL1BatchBlockRange

Returns the range of blocks contained within a batch given by batch number.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const batchBlockRange = await client.getL1BatchBlockRange({
  number:1
});
```

## Returns 

`GetL1BatchBlockRangeReturnParameters`

Array of two elements representing the range of blocks within a batch.

## Parameters

### number

L1 Batch Number

- **Type** `number`

```ts
const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const batchBlockRange = await client.getL1BatchBlockRange({
  number:1  // [!code focus]
});
```