# setBlockGasLimit

Sets the block's gas limit.

## Import 

```ts
import { setBlockGasLimit } from 'viem/test'
```

## Usage

```ts
import { setBlockGasLimit } from 'viem/test'
import { testClient } from '.'
 
await setBlockGasLimit(testClient, { // [!code focus:4]
  gasLimit: 420_000n
})
```

## Parameters

### gasLimit

- **Type:** `bigint`

The gas limit.

```ts
await setBlockGasLimit(testClient, {
  gasLimit: 420_000n // [!code focus]
})
```