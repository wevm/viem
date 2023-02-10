# stopImpersonatingAccount

Stop impersonating an account after having previously used [`impersonateAccount`](/docs/actions/test/impersonateAccount).

## Import 

```ts
import { stopImpersonatingAccount } from 'viem/test'
```

## Usage

```ts
import { stopImpersonatingAccount } from 'viem/test'
import { testClient } from '.'
 
await stopImpersonatingAccount(testClient, { // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
})
```

## Parameters

### address

- **Type:** `Address`

The address of the target account.

```ts
await stopImpersonatingAccount(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
})
```
