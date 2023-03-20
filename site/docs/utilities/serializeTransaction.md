---
head:
  - - meta
    - property: og:title
      content: serializeTransaction
  - - meta
    - name: description
      content: Computes a serialized transaction.
  - - meta
    - property: og:description
      content: Computes a serialized transaction.

---

# serializeTransaction

Serializes a transaction object. Support `EIP-1559`, `EIP-2930` and `Legacy` type transactions. Pre `EIP-155` transactions are not supported.

## Import
```ts
import { serializeTransaction } from "viem"
```

## Usage
```ts
import { serializeTransaction } from "viem"

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
```

## Returns

Based on the transaction type.

- Type `eip1559` will return [EIP1559Serialized](/docs/glossary/types#EIP1559Serialized)
- Type `eip2930` will return [EIP2930Serialized](/docs/glossary/types#EIP2930Serialized)
- Type `legacy`  will return [Hex](/docs/glossary/types#hex) 

## Parameters

### transaction

- **Type:** `Omit<TransactionRequest, 'from'> & { chainId: number }`

The transaction object to serialize.

```ts
import { serializeTransaction } from "viem"

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  gasPrice: 2n
  value: 1n,
  data: "0x",
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  accessList: []
}, {
  type: "eip2930"
})
```

### options

- **Type:** `{type: TransactionType, signature?: Signature}`

The transaction type and the optional parameter `signature` in case you want to serialize a transaction with a signature.

```ts
import { serializeTransaction } from "viem"

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  gasPrice: 2n
  value: 1n,
  data: "0x",
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  accessList: []
}, {
  type: "eip2930" // [!code focus]
})
```

The transaction type will get infered based on the transaction object if it has specific properties (e.g. `gasPrice`, `accessList`, `maxFeePerGas`, `maxPriorityFeePerGas`). The default value is `TransactionType`.

### Signature
- Optional signature to serialize.

```ts
import { serializeTransaction } from "viem"

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  gasPrice: 2n
  value: 1n,
  data: "0x",
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  accessList: []
}, {
  type: "eip2930" 
  signature: { // [!code focus]
    r: "0x123451234512345123451234512345123451234512345123451234512345" // [!code focus]
    s: "0x123451234512345123451234512345123451234512345123451234512345" // [!code focus]
    v: 28n // [!code focus]
  } // [!code focus]
})
```
