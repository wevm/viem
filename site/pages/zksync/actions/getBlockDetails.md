---
description: Returns additional zkSync-specific information about the L2 block.
---

# getBlockDetails

Returns additional zkSync-specific information about the L2 block.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const blockDetails = await client.getBlockDetails({number:1});

```

