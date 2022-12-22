# stopImpersonatingAccount

Stop impersonating an account after having previously used [`impersonateAccount`](/TODO).

## Import 

```ts
import { stopImpersonatingAccount } from 'viem'
```

## Usage

```ts
import { stopImpersonatingAccount } from 'viem'
import { testClient } from '.'
 
await stopImpersonatingAccount(testClient, { // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
})
```

## Configuration

### address

- **Type:** `Address`

The address of the target account.

```ts
await stopImpersonatingAccount(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
})
```
