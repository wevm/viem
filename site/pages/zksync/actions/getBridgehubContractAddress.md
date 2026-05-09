---
description: Returns the Bridgehub smart contract address.
---

# getBridgehubContractAddress

Returns the Bridgehub smart contract address.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getBridgehubContractAddress();
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

Bridgehub smart contract address.