# getGasPrice

Returns the current price of gas (in wei).

## Usage

```ts
import { publicClient } from '.'
 
const gasPrice = await publicClient.getGasPrice() // [!code focus:4]
```

## Returns

`bigint`

The gas price (in wei).
