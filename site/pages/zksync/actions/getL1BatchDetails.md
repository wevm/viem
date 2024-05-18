---
description: Returns data pertaining to a given batch.
---

# getL1BatchDetails

Returns data pertaining to a given batch.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const batchDetails = await client.getL1BatchDetails({
  number: 1
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`BatchDetails`

Data concerning given batch.

## Parameters

### number

L1 Batch Number

- **Type** `number`

```ts
const batchDetails = await client.getL1BatchDetails({
  number: 1  // [!code focus]
});
```