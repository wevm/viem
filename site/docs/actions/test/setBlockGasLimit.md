# setBlockGasLimit

Sets the block's gas limit.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setBlockGasLimit({ // [!code focus:4]
  gasLimit: 420_000n
})
```

## Parameters

### gasLimit

- **Type:** `bigint`

The gas limit.

```ts
await testClient.setBlockGasLimit({
  gasLimit: 420_000n // [!code focus]
})
```