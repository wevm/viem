---
head:
  - - meta
    - property: og:title
      content: parseTransaction
  - - meta
    - name: description
      content: Converts a serialized transaction to a structured transaction.
  - - meta
    - property: og:description
      content: Converts a serialized transaction to a structured transaction.

---

# parseTransaction

Parses a previously serialized transaction object. Supports `EIP-1559`, `EIP-2930` and `Legacy` type transactions. Pre `EIP-155` transactions are not supported. Supports both signed, and unsigned serialized transactions.

## Import
```ts
import { parseTransaction } from "viem"
```

## Usage
```ts
import { serializeTransaction, parseTransaction } from "viem"

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: 2n,
  maxPriorityFeePerGas: 2n,
  value: 1n,
  data: "0x",
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  accessList:[]
}, {
  type: "eip1559"
})

const parsed = parseTransaction({
  type: "eip1559", encodedTransaction: serialized
})
```

## Returns

`Omit<TransactionRequest, 'from'> & ({ chainId: number } | {chainId: number & Signature})`

The parsed transaction object.

## Parameters

### transaction

- **Type:** `{ type: TransactionType ; encodedTransaction: EIP1559Serialized | EIP2930Serialized | Hex  }`

The transaction object to serialize.

```ts
import { parseTransaction } from "viem"

const parseTransaction = parseTransaction({
  type: "eip1559", // [!code focus]
  encodedTransaction: serialized // [!code focus]
})
```

The `type` property will infer the `encodedTransaction` type and vice-versa (e.g. the `type` `eip1559` will require that the `encodedTransaction` be of type `EIP1559Serialized`. 
