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

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const gasPrice = await publicClient.getGasPrice() // [!code focus:4]
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`bigint`

The gas price (in wei).

## JSON-RPC Method

[`eth_gasPrice`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice)