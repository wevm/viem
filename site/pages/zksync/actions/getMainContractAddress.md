---
description: Returns the address of a Main zkSync Contract.
---

# getMainContractAddress

Returns the address of a Main zkSync Contract.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getMainContractAddress();
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`Address`

Main zkSync Era smart contract address.