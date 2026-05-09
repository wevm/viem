---
description: Modifies the balance of an account.
---

# setBalance

Modifies the balance of an account.

## Usage

:::code-group

```ts [example.ts]
import { parseEther } from 'viem'
import { testClient } from './client'
 
await testClient.setBalance({ // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('1')
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

The address of the target account.

```ts
await testClient.setBalance({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

The value (in wei) to set.

```ts
await testClient.setBalance({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: 1000000000000000000n // [!code focus]
})
```