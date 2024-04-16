---
description: Returns data of transactions in a block.
---

# getRawBlockTransaction

Returns data of transactions in a block.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const rawTx = await client.getRawBlockTransaction({number:1});

```

