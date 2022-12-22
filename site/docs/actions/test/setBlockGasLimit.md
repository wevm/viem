# setBlockGasLimit

Sets the block's gas limit.

## Import 

```ts
import { setBlockGasLimit } from 'viem'
```

## Usage

```ts
import { setBlockGasLimit } from 'viem'
import { testClient } from '.'
 
await setBlockGasLimit(testClient, { // [!code focus:4]
  gasLimit: 420_000n
})
```

## Configuration

### gasLimit

- **Type:** `bigint`

The gas limit.

```ts
await setBlockGasLimit(testClient, {
  gasLimit: 420_000n // [!code focus]
})
```