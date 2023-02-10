# getGasPrice

Returns the current price of gas (in wei).

## Import

```ts
import { getGasPrice } from 'viem/public'
```

## Usage

```ts
import { getGasPrice } from 'viem/public'
import { publicClient } from '.'
 
const gasPrice = await getGasPrice(publicClient) // [!code focus:4]
```

## Returns

`bigint`

The gas price (in wei).
