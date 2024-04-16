---
description: Returns all known balances for a given account.
---

# getAllBalances

Returns all known balances for a given account.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const balances = await client.getAllBalances({address:"0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"});

```

