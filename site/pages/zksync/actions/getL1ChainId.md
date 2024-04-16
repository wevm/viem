---
description: Returns the Chain Id of underlying L1 network.
---

# getL1ChainId

Returns the Chain Id of underlying L1 network.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const chainId = await client.getL1ChainId();

```

