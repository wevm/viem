---
description: Serializes a transaction object.
---

# serializeTransaction

Serializes a transaction object. Supports EIP-1559, EIP-2930, and Legacy transactions.

## Import

```ts
import { serializeTransaction } from 'viem'
```

## Usage

```ts
import { serializeTransaction } from 'viem'

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

## Returns

Returns a template `Hex` value based on transaction type:

- `eip1559`: [TransactionSerializedEIP1559](/docs/glossary/types#TransactionSerializedEIP1559)
- `eip2930`: [TransactionSerializedEIP2930](/docs/glossary/types#TransactionSerializedEIP2930)
- `eip4844`: [TransactionSerializedEIP4844](/docs/glossary/types#TransactionSerializedEIP4844)
- `eip7702`: [TransactionSerializedEIP7702](/docs/glossary/types#TransactionSerializedEIP7702)
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

Optional signature to include.

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
