# impersonateAccount

Impersonate an account or contract address. This lets you send transactions from that account even if you don't have access to its private key.

## Import 

```ts
import { impersonateAccount } from 'viem'
```

## Usage

```ts
import { impersonateAccount } from 'viem'
import { testClient } from '.'
 
await impersonateAccount(testClient, { // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
})
```

## Parameters

### address

- **Type:** `Address`

The address of the target account.

```ts
await impersonateAccount(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
})
```
