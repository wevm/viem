---
description: Returns the address of a Paymaster on a Testnet.
---

# getTestnetPaymasterAddress

Returns the address of a Paymaster on a Testnet.

## Usage

```ts
import { getTestnetPaymasterAddress } from 'viem/zksync'
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const address = await client.getTestnetPaymasterAddress();
```

## Returns 

`Address`

Testnet paymaster address if available, or `null`.