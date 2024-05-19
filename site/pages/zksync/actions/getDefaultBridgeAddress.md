---
description: Returns the addresses of the default zkSync Era bridge contracts on both L1 and L2.
---

# getDefaultBridgeAddresses

Returns the addresses of the default zkSync Era bridge contracts on both L1 and L2.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const addresses = await client.getDefaultBridgeAddresses();
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`GetDefaultBridgeAddressesReturnType`

Addresses of the default zkSync Era bridge contracts on both L1 and L2.
