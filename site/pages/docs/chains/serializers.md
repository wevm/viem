# Serializers [Configure chain-based serializers in Viem]

## Usage

```ts
import { defineChain, serializeTransaction } from 'viem'

const example = defineChain({
  /* ... */
  serializers: {
    transaction(transaction, signature) {
      return serializeTransaction(transaction, signature)
    },
  },
})
```

## API

### `serializers.transaction`

- **Type**: `(transaction: Transaction, signature?: Signature) => "0x${string}"`

You can modify how Transactions are serialized by using the `serializers.transaction` property on the Chain.

**Parameters**

- `transaction`: The transaction to serialize.
- `signature`: The transaction signature (if exists).

```ts
import { defineChain, serializeTransaction } from 'viem'

const example = defineChain({
  /* ... */
  serializers: { // [!code focus:5]
    transaction(transaction, signature) {
      return serializeTransaction(transaction, signature)
    },
  },
})
```