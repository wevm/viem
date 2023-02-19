# setBalance

Modifies the balance of an account.

## Usage

```ts
import { parseEther } from 'viem'
import { testClient } from '.'
 
await testClient.setBalance({ // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('1')
})
```

## Parameters

### address

- **Type:** `Address`

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