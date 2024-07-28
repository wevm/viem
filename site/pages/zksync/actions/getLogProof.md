---
description: Given a transaction hash, and an index of the L2 to L1 log produced within the transaction, it returns the proof for the corresponding L2 to L1 log.
---

# getLogProof

Returns the proof for the corresponding L2 to L1 log.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const proof = await client.getLogProof({
  txHash: '0x...',
  index: 1
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`GetLogProofReturnType`

Proof of the corresponding L2 to L1 log

## Parameters

### txHash

Hash of the L2 transaction the L2 to L1 log was produced within.

```ts
const proof = await client.getLogProof({
  txHash: '0x...', // [!code focus]
  index: 1
});
```

### index (optional)

The index of the L2 to L1 log in the transaction.

```ts
const proof = await client.getLogProof({
  txHash: '0x...', 
  index: 1 // [!code focus]
});

```