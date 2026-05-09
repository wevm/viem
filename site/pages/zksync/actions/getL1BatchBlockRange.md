---
description: Returns the range of blocks contained within a batch given by batch number.
---

# getL1BatchBlockRange

Returns the range of blocks contained within a batch given by batch number.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const batchBlockRange = await client.getL1BatchBlockRange({
  number: 1
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`GetL1BatchBlockRangeReturnType`

Array of two elements representing the range of blocks within a batch.

## Parameters

### number

L1 Batch Number

- **Type** `number`

```ts
const batchBlockRange = await client.getL1BatchBlockRange({
  number: 1  // [!code focus]
});
```