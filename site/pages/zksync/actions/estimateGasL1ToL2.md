---
description: Returns an estimated gas for L1 to L2 execution.
---

# estimateGasL1ToL2

Returns an estimated gas for L1 to L2 execution

## Usage

:::code-group
```ts [example.ts]
import { client } from './config'

const gas = await client.estimateGasL1ToL2({
  account: '0x636A122e48079f750d44d13E5b39804227E1467e',
  to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
  value: 0n
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

`bigint` number that represents the gas required.

## Parameters

`EstimateGasL1ToL2Parameters`
