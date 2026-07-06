---
description: Sets the block's gas limit.
---

# setBlockGasLimit

Sets the block's gas limit.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'
 
await testClient.setBlockGasLimit({ // [!code focus:4]
  gasLimit: 420_000n
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

### gasLimit

- **Type:** `bigint`

The gas limit.

```ts
await testClient.setBlockGasLimit({
  gasLimit: 420_000n // [!code focus]
})
```