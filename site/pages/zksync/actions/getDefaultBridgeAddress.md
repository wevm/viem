---
description: Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.
---

# getDefaultBridgeAddresses

Returns the addresses of the default ZKsync Era bridge contracts on both L1 and L2.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const addresses = await client.getDefaultBridgeAddresses();
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`GetDefaultBridgeAddressesReturnType`

Addresses of the default ZKsync Era bridge contracts on both L1 and L2.
