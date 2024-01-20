---
description: Returns the automatic mining status of the node.
---

# getAutomine

Returns the automatic mining status of the node.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

const isAutomining = await testClient.getAutomine() // [!code focus]
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

`boolean`

Whether or not the node is auto mining.
