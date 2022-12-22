# setNextBlockBaseFeePerGas

Sets the next block's base fee per gas.

## Import 

```ts
import { setNextBlockBaseFeePerGas } from 'viem'
```

## Usage

```ts
import { setNextBlockBaseFeePerGas } from 'viem'
import { testClient } from '.'
 
await setNextBlockBaseFeePerGas(testClient, { // [!code focus:4]
  baseFeePerGas: parseGwei('20')
})
```

## Configuration

### baseFeePerGas

- **Type:** `bigint`

Base fee per gas.

```ts
await setNextBlockBaseFeePerGas(testClient, {
  baseFeePerGas: parseGwei('30') // [!code focus]
})
```