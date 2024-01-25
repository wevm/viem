---
description: Returns the chain ID associated with the current network
---

# getChainId

Returns the chain ID associated with the current network

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const chainId = await publicClient.getChainId() // [!code focus:99]
// @log: 1
```

```ts [client.ts] filename="client.ts"
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