---
description: Converts a serialized transaction to a structured transaction.
---

# parseTransaction

Parses a serialized RLP-encoded transaction. Supports signed & unsigned EIP-1559, EIP-2930 and Legacy Transactions.

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

The parsed transaction object.

## Parameters

### serializedTransaction

- **Type:** `Hex`

The serialized transaction.
