---
description: Returns the scaled gas per pubdata limit for the currently open batch.
---

# getGasPerPubData

Returns the scaled gas per pubdata limit for the currently open batch.

:::info
This method is only available ZKsync chains running node API version 28.7.0 and above.
:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const gasPerPubDataLimit = await client.getGasPerPubData();
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

Pubdata limit for the current batch.
