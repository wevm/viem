---
description: Returns the Chain Id of underlying L1 network.
---

# getL1ChainId

Returns the Chain Id of underlying L1 network.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const chainId = await client.getL1ChainId();
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

L1 Chain ID.