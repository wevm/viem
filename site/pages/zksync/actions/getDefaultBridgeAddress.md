---
description: Returns the addresses of the default zkSync Era bridge contracts on both L1 and L2.
---

# getDefaultBridgeAddresses

Returns the addresses of the default zkSync Era bridge contracts on both L1 and L2.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const addresses = await client.getDefaultBridgeAddresses();
```

## Returns 

`BridgeContractsReturnType`

Addresses of the default zkSync Era bridge contracts on both L1 and L2.
