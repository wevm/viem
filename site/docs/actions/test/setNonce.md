# setNonce

Modifies (overrides) the nonce of an account.

## Import 

```ts
import { setNonce } from 'viem'
```

## Usage

```ts
import { setNonce } from 'viem'
import { testClient } from '.'
 
await setNonce(testClient, { // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  nonce: 420
})
```

## Parameters

### address

- **Type:** `Address`

The address of the target account.

```ts
await setNonce(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
  nonce: 420
})
```

### nonce (optional)

- **Type:** `number`

The nonce.

```ts
await setNonce(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  nonce: 420 // [!code focus]
})
```