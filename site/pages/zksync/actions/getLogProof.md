---
description: Given a transaction hash, and an index of the L2 to L1 log produced within the transaction, it returns the proof for the corresponding L2 to L1 log.
---

# getLogProof

Returns the proof for the corresponding L2 to L1 log.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const proof = await client.getLogProof({
  txHash:"0x...",
  index:1
});
```

## Returns 

`MessageProof`

Proof of the corresponding L2 to L1 log

## Parameters

`GetLogProofParameters`

### txHash

Hash of the L2 transaction the L2 to L1 log was produced within.

```ts
const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const proof = await client.getLogProof({
  txHash:"0x...", // [!code focus]
  index:1
});
```

### index 

The index of the L2 to L1 log in the transaction (optional).

```ts
const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())

const proof = await client.getLogProof({
  txHash:"0x...", 
  index:1 // [!code focus]
});

```