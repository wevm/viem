---
description: Converts a serialized transaction to a structured transaction, with support for OP Stack.
---

# parseTransaction (OP Stack)

Parses a serialized RLP-encoded transaction. Supports signed & unsigned Deposit, Post-exec, EIP-1559, EIP-2930 and Legacy Transactions.

## Import
```ts
import { parseTransaction } from 'viem/op-stack'
```

## Usage

```ts
import { parseTransaction } from 'viem/op-stack'

const transaction = parseTransaction('0x02ef0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0')
```

### Deposit Transactions

The `parseTransaction` module from `viem/op-stack` also supports parsing deposit transactions (`0x7e`-prefixed):

```ts
import { parseTransaction } from 'viem/op-stack'

const transaction = parseTransaction('0x7ef83ca018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808080')
```

### Post-exec Transactions

It also parses post-exec transactions (`0x7d`-prefixed), which a sequencer appends to a block from OP Stack Upgrade 22 (Lagoon). The payload after the type byte is returned as `data`:

```ts
import { parseTransaction } from 'viem/op-stack'

const transaction = parseTransaction('0x7dc60110c3c2012a')
// @log: { data: '0xc60110c3c2012a', type: 'postExec' }
```

## Returns

`TransactionSerializable`

The parsed transaction object.

## Parameters

### serializedTransaction

- **Type:** `Hex`

The serialized transaction.
