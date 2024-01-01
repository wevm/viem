---
description: Stop impersonating an account after having previously used impersonateAccount.
---

# stopImpersonatingAccount

Stop impersonating an account after having previously used [`impersonateAccount`](/docs/actions/test/impersonateAccount).

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

await testClient.stopImpersonatingAccount({ // [!code focus:4]
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
await testClient.stopImpersonatingAccount({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
})
```
