---
description: Returns the address of a shared bridge.
---

# sharedBridge

:::code-group
```ts [example.ts]
import { client } from './config'

const sharedBride = await client.sharedBride({bridgehubContractAddress:"0x5C221E77624690fff6dd741493D735a17716c26B"});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL1 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSyncLocalNodeL1,
  transport: http(),
}).extend(publicActionsL1())

```
:::

# Returns

The address of a shared bridge.

## Parameters

### bridgehubContractAddress

- **Type:** `Address`

```ts [example.ts]
import { client } from './config'

  const sharedBride = await client.sharedBride(
    bridgehubContractAddress:"0x5C221E77624690fff6dd741493D735a17716c26B" //[!code focus]
  );
```