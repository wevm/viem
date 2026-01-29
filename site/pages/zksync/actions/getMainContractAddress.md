---
description: Returns the address of a Main ZKsync Contract.
---

# getMainContractAddress

Returns the address of a Main ZKsync Contract.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getMainContractAddress();
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

Main ZKsync Era smart contract address.