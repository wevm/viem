# setBalance

Modifies the balance of an account.

## Import 

```ts
import { setBalance } from 'viem'
```

## Usage

```ts
import { setBalance, parseEther } from 'viem'
import { testClient } from '.'
 
await setBalance(testClient, { // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('1')
})
```

## Configuration

### address

- **Type:** `Address`

The address of the target account.

```ts
await setBalance(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

The value (in wei) to set.

```ts
await setBalance(testClient, {
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: 1000000000000000000n // [!code focus]
})
```