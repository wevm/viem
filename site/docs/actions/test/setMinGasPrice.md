# setMinGasPrice

Change the minimum gas price accepted by the network (in wei).

## Import 

```ts
import { setMinGasPrice } from 'viem'
```

## Usage

```ts
import { setMinGasPrice, parseGwei } from 'viem'
import { testClient } from '.'
 
await setMinGasPrice(testClient, { // [!code focus:99]
  gasPrice: parseGwei('20'),
})
```

## Configuration

### gasPrice

- **Type:** `bigint`

The gas price (in wei).

```ts
await setMinGasPrice(testClient, {
  gasPrice: parseGwei('20'), // [!code focus]
})
```
