---
description: Serializes a transaction object, with support for OP Stack.
---

# serializeTransaction (OP Stack)

Serializes a transaction object, with support for OP Stack transactions. Supports Deposit, EIP-1559, EIP-2930, and Legacy transactions.

## Import

```ts
import { serializeTransaction } from 'viem/op-stack'
```

## Usage

```ts
import { serializeTransaction } from 'viem/op-stack'

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  value: parseEther('0.01'),
})
```

### Deposit Transactions

The `serializeTransaction` module from `viem/op-stack` also supports serializing deposit transactions:

```ts
import { parseEther } from 'viem'
import { serializeTransaction } from 'viem/op-stack'

const serialized = serializeTransaction({
  from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
  gas: 21000n,
  mint: parseEther('1'),
  sourceHash: '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
  value: parseEther('1'),
  type: 'deposit'
})
```

## Returns

Returns a template `Hex` value based on transaction type:

- `deposit`: [TransactionSerializedDeposit](/docs/glossary/types#TransactionSerializedDeposit)
- `eip1559`: [TransactionSerializedEIP1559](/docs/glossary/types#TransactionSerializedEIP1559)
- `eip2930`: [TransactionSerializedEIP2930](/docs/glossary/types#TransactionSerializedEIP2930)
- `legacy`: [TransactionSerializedLegacy](/docs/glossary/types#TransactionSerializedLegacy) 

## Parameters

### transaction

- **Type:** `TransactionSerializable`

The transaction object to serialize.

```ts
const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69,
  to: '0x1234512345123451234512345123451234512345',
  value: parseEther('0.01'),
})
```

### signature

- **Type:** `Hex`

Optional signature to include. **Ignored for deposit transactions.**

```ts
const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69,
  to: '0x1234512345123451234512345123451234512345',
  value: parseEther('0.01'),
}, { // [!code focus:5]
  r: '0x123451234512345123451234512345123451234512345123451234512345',
  s: '0x123451234512345123451234512345123451234512345123451234512345',
  yParity: 1
})
```
