---
description: Sets the automatic mining interval (in seconds) of blocks.
---

# setIntervalMining

Sets the automatic mining interval (in seconds) of blocks. Setting the interval to `0` will disable automatic mining.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'
 
await testClient.setIntervalMining({ // [!code focus:4]
  interval: 5
})
```

```ts [client.ts]
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

export const testClient = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
```

:::

## Parameters

### interval

- **Type:** `number`

The mining interval (in seconds). Setting the interval to `0` will disable automatic mining.

```ts
await testClient.setIntervalMining({
  interval: 5 // [!code focus]
})
```