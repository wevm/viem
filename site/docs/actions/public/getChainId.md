---
head:
  - - meta
    - property: og:title
      content: getChainId
  - - meta
    - name: description
      content: Returns the chain ID associated with the current network
  - - meta
    - property: og:description
      content: Returns the chain ID associated with the current network

---

# getChainId

Returns the chain ID associated with the current network

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const chainId = await publicClient.getChainId() // [!code focus:99]
// 1
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

`number`

The current chain ID.

## JSON-RPC Method

- Calls [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid).