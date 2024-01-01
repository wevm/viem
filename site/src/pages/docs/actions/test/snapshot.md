---
description: Snapshot the state of the blockchain at the current block.
---

# snapshot

Snapshot the state of the blockchain at the current block.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

const id = await testClient.snapshot() // [!code focus]
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

## Returns

ID of the snapshot that was created.