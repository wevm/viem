---
description: Resets the fork back to its original state.
---

# reset

Resets the fork back to its original state.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.reset() // [!code focus]
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

### blockNumber (optional)

- **Type:** `bigint`

Resets the fork to a given block number.

```ts
await testClient.reset({
  blockNumber: 69420n, // [!code focus]
  jsonRpcUrl: 'https://mainnet.g.alchemy.com/v2'
})
```

### jsonRpcUrl (optional)

- **Type:** `string`

Resets the fork with a given JSON RPC URL.

```ts
await testClient.reset({
  blockNumber: 69420n,
  jsonRpcUrl: 'https://mainnet.g.alchemy.com/v2' // [!code focus]
})
```
