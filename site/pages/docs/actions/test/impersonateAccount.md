---
description: Impersonate an account or contract address.
---

# impersonateAccount

Impersonate an account or contract address. This lets you send transactions from that account even if you don't have access to its private key.

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.impersonateAccount({ // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
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
await testClient.impersonateAccount({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
})
```
