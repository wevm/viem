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
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`GetL1BatchDetailsReturnType`

Batch details.

## Parameters

### number

L1 Batch Number

- **Type** `number`

```ts
const batchDetails = await client.getL1BatchDetails({
  number: 1  // [!code focus]
});
```