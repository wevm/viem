---
description: Returns the latest L1 batch number.
---

# getL1BatchNumber

Returns the latest L1 batch number.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const latestNumber = await client.getL1BatchNumber();
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

`Hex`

Latest L1 batch number. 