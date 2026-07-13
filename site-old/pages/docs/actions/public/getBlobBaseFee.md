---
description: Returns the current blob base fee (in wei).
---

# getBlobBaseFee

Returns the current blob base fee (in wei).

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const baseFee = await publicClient.getBlobBaseFee() // [!code focus]
```

```ts twoslash [client.ts] filename="client.ts"
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

the blob base fee (in wei).

## JSON-RPC Method

[`eth_blobBaseFee`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice)