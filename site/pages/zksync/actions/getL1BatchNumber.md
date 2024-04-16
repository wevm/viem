---
description: Returns the latest L1 batch number.
---

# getL1BatchNumber

Returns the latest L1 batch number.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const latestNumber = await client.getL1BatchNumber();
```

## Returns 

`number`

Latest L1 batch number. 