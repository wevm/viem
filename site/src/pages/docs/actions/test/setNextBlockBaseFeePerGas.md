---
description: Sets the next block's base fee per gas.
---

# setNextBlockBaseFeePerGas

Sets the next block's base fee per gas.

## Usage

:::code-group

```ts [example.ts]
import { parseGwei } from 'viem'
import { testClient } from './client'
 
await testClient.setNextBlockBaseFeePerGas({ // [!code focus:4]
  baseFeePerGas: parseGwei('20')
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

### baseFeePerGas

- **Type:** `bigint`

Base fee per gas.

```ts
await testClient.setNextBlockBaseFeePerGas({
  baseFeePerGas: parseGwei('30') // [!code focus]
})
```