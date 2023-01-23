# reset

Resets the fork back to its original state.

## Import 

```ts
import { reset } from 'viem'
```

## Usage

```ts
import { reset } from 'viem'
import { testClient } from '.'
 
await reset(testClient) // [!code focus]
```

## Parameters

### blockNumber (optional)

- **Type:** `bigint`

Resets the fork to a given block number.

```ts
await reset(testClient, {
  blockNumber: 69420n,
  jsonRpcUrl: 'https://mainnet.g.alchemy.com/v2' // [!code focus]
})
```

### jsonRpcUrl (optional)

- **Type:** `string`

Resets the fork with a given JSON RPC URL.

```ts
await reset(testClient, {
  blockNumber: 69420n, // [!code focus]
  jsonRpcUrl: 'https://mainnet.g.alchemy.com/v2'
})
```