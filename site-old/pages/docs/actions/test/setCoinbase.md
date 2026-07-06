---
description: Sets the coinbase address to be used in new blocks.
---

# setCoinbase

Sets the coinbase address to be used in new blocks.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'
 
await testClient.setCoinbase({ // [!code focus:99]
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
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

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The coinbase address.

```ts
await testClient.setCoinbase({
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79', // [!code focus]
})
```
