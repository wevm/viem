---
description: Mine a specified number of blocks.
---

# mine

Mine a specified number of blocks.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.mine({ // [!code focus:4]
  blocks: 1,
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

### blocks

- **Type:** `number`

Number of blocks to mine.

```ts
await testClient.mine({
  blocks: 1, // [!code focus:4]
})
```

### interval (optional)

- **Type:** `number`
- **Default:** `1`

Interval between each block in seconds.

```ts
await testClient.mine({
  blocks: 10,
  interval: 4 // [!code focus]
})
```