# dropTransaction

Remove a transaction from the mempool.

## Import 

```ts
import { dropTransaction } from 'viem/test'
```

## Usage

```ts
import { dropTransaction } from 'viem/test'
import { testClient } from '.'
 
await dropTransaction(testClient, { // [!code focus:4]
  hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364'
})
```

## Parameters

### hash

- **Type:** ``"0x${string}"``

The hash of the transaction.

```ts
await dropTransaction(testClient, {
  hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364', // [!code focus]
})
```
