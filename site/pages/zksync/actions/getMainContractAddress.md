---
description: Returns the address of a Main zkSync Contract.
---

# getMainContractAddress

Returns the address of a Main zkSync Contract.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const address = await client.getMainContractAddress();
```
## Returns 

`Address`

Main zkSync Era smart contract address.