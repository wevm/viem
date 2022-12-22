# revert

revert the state of the blockchain at the current block.

## Import 

```ts
import { revert } from 'viem'
```

## Usage

```ts
import { revert } from 'viem'
import { testClient } from '.'
 
await revert(testClient, { // [!code focus:99]
  id: '0x...'
})
```

## Configuration

### id

- **Type:** ``"0x${string}"``

The snapshot ID.

```ts
await revert(testClient, {
  id: '0x...' // [!code focus]
})
```