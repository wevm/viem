---
description: Computes the L2 transaction hashes from an array of L1 "TransactionDeposited" logs.
---

# getL2TransactionHashes

Computes the L2 transaction hashes from an array of L1 `TransactionDeposited` logs.

Useful for extracting L2 hashes from an **L1 Transaction Receipt**.

## Import
```ts
import { getL2TransactionHashes } from 'viem'
```

## Usage

```ts
import { extractTransactionDepositedLogs, getL2TransactionHashes } from 'viem'

const receipt = await client.getTransactionReceipt({
  hash: '0xa08acae48f12243bccd7153c88d892673d5578cce4ee9988c0332e8bba47436b',
})

const l2Hashes = getL2TransactionHashes(receipt) // [!code hl]
```

## Returns

`Hex`

The L2 transaction hash.

## Parameters

### logs

- **Type:** `Log[]`

An array of L1 logs.

```ts
const l2Hashes = getL2TransactionHash({ 
  logs: receipt.logs // [!code focus]
})
```
