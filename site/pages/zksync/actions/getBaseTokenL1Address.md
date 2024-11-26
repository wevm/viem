---
description: Returns the base token L1 address.
---

# getBaseTokenL1Address

Returns the address of the base L1 token.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getBaseTokenL1Address();
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

`Address`

Base Token L1 address.