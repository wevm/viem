---
head:
  - - meta
    - property: og:title
      content: getGasPrice
  - - meta
    - name: description
      content: Returns the current price of gas (in wei).
  - - meta
    - property: og:description
      content: Returns the current price of gas (in wei).

---

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
