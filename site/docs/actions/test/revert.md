# revert

Revert the state of the blockchain at the current block.

## Import 

```ts
import { revert } from 'viem/test'
```

## Usage

```ts
import { revert } from 'viem/test'
import { testClient } from '.'
 
await revert(testClient, { // [!code focus:99]
  id: '0x...'
})
```

## Parameters

### id

- **Type:** ``"0x${string}"``

The snapshot ID.

```ts
await revert(testClient, {
  id: '0x...' // [!code focus]
})
```