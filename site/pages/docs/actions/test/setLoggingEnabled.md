---
description: Enable or disable logging on the test node network.
---

# setLoggingEnabled

Enable or disable logging on the test node network.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'
 
await testClient.setLoggingEnabled(true) // [!code focus]
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
