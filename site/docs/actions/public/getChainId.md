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

```ts
import { publicClient } from '.'
 
const block = await publicClient.getChainId() // [!code focus:99]
// 1
```

## Returns

`number`

The current chain ID.

## JSON-RPC Method

- Calls [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid).