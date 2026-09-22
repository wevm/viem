---
description: Serializes a transaction object.
---

# serializeTransaction

Serializes a transaction object, including [EIP-8141 frame transactions](https://eips.ethereum.org/EIPS/eip-8141).

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

## Frame Transactions

Use `frames` and an explicit `sender` to serialize an EIP-8141 envelope. Chain IDs and nonces use numbers; frame gas budgets, values, and fees use bigint.

```ts twoslash
import { serializeTransaction } from 'viem'

const serialized = serializeTransaction({
  chainId: 1,
  frames: [
    { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
    {
      gas: 50_000n,
      mode: 'sender',
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
    },
  ],
  maxFeePerGas: 20_000_000_000n,
  maxPriorityFeePerGas: 1_000_000_000n,
  nonce: 0,
  sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  signatures: [{ scheme: 'secp256k1' }],
})
```

:::warning
EIP-8141 is a draft. This example serializes an unsigned transaction with explicit gas budgets. Sending requires populated signatures and compatible client support.
:::

Frame transactions use the `signatures` array. Passing the separate `signature` argument or outer fields such as `to`, `value`, and `accessList` throws. An explicit `type` takes precedence over inference; incompatible fields also throw.

The canonical signing hash excludes witnesses whose `payload` is empty. Use Ox's [`TxEnvelopeEip8141.getSignPayload`](https://github.com/wevm/ox/blob/ox%400.14.47/src/core/TxEnvelopeEip8141.ts) when signing entries manually. Hashing a populated serialized envelope with `keccak256` does not produce that signing hash.

Blob transactions accept `blobVersionedHashes` and PeerDAS `sidecars` containing `blobs`, `commitments`, and `cellProofs`. This wrapper differs from EIP-4844's array of blob sidecars.

## Returns

Returns a template `Hex` value based on transaction type:

- `eip1559`: [TransactionSerializedEIP1559](/docs/glossary/types#TransactionSerializedEIP1559)
- `eip2930`: [TransactionSerializedEIP2930](/docs/glossary/types#TransactionSerializedEIP2930)
- `eip4844`: [TransactionSerializedEIP4844](/docs/glossary/types#TransactionSerializedEIP4844)
- `eip7702`: [TransactionSerializedEIP7702](/docs/glossary/types#TransactionSerializedEIP7702)
- `eip8141`: `TransactionSerializedEIP8141` (`0x06${string}`)
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
