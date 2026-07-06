---
description: Change the minimum gas price accepted by the network (in wei).
---

# setMinGasPrice

Change the minimum gas price accepted by the network (in wei).

> Note: `setMinGasPrice` can only be used on clients that do not have EIP-1559 enabled.

## Usage

:::code-group

```ts [example.ts]
import { parseGwei } from 'viem'
import { testClient } from './client'
 
await testClient.setMinGasPrice({ // [!code focus:99]
  gasPrice: parseGwei('20'),
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

### gasPrice

- **Type:** `bigint`

The gas price (in wei).

```ts
await testClient.setMinGasPrice({
  gasPrice: parseGwei('20'), // [!code focus]
})
```
