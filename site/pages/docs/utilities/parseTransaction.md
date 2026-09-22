---
description: Converts a serialized transaction to a structured transaction.
---

# parseTransaction

Parses a signed or unsigned RLP-encoded transaction.

## Import
```ts
import { parseTransaction } from 'viem'
```

## Usage
```ts
import { parseTransaction } from 'viem'

const transaction = parseTransaction('0x02ef0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0')
```

## Returns

`TransactionSerializable`

The parsed transaction object. EIP-8141 results contain `sender`, `frames`, and `signatures`, including unsigned signature placeholders. Frame destinations use `to`; gas budgets use `gas` and `stateGas`.

Chain IDs and nonces use numbers. Parsing throws if either exceeds `Number.MAX_SAFE_INTEGER`. PeerDAS sidecars are retained when present.

Parsing does not verify account authorization. [`recoverTransactionAddress`](/docs/utilities/recoverTransactionAddress) rejects frame transactions because they can contain multiple signers.

## Parameters

### serializedTransaction

- **Type:** `Hex`

The serialized transaction.
