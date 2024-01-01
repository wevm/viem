---
description: Revert the state of the blockchain at the current block.
---

# revert

Revert the state of the blockchain at the current block.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.revert({ // [!code focus:99]
  id: '0x...'
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

### id

- **Type:** ``"0x${string}"``

The snapshot ID.

```ts
await testClient.revert({
  id: '0x...' // [!code focus]
})
```