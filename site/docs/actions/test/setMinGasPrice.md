# setMinGasPrice

Change the minimum gas price accepted by the network (in wei).

> Note: `setMinGasPrice` can only be used on clients that do not have EIP-1559 enabled.

## Usage

```ts
import { parseGwei } from 'viem/utils'
import { testClient } from '.'
 
await testClient.setMinGasPrice({ // [!code focus:99]
  gasPrice: parseGwei('20'),
})
```

## Parameters

### gasPrice

- **Type:** `bigint`

The gas price (in wei).

```ts
await testClient.setMinGasPrice({
  gasPrice: parseGwei('20'), // [!code focus]
})
```
