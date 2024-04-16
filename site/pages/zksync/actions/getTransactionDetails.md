---
description: Returns data from a specific transaction given by the transaction hash.
---

# getTransactionDetails

Returns data from a specific transaction given by the transaction hash.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const details = await client.getTransactionDetails({
  txHash:"0x..."
});
```

## Returns 

`TransactionDetails`

Data from a specific transaction given by the transaction hash.

## Parameters

`GetTransactionDetailsParameters`

### hash

Transaction hash

```ts

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const details = await client.getTransactionDetails({
  txHash:"0x..." // [!code focus]
});
```
