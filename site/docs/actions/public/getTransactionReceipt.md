---
head:
  - - meta
    - property: og:title
      content: getTransactionReceipt
  - - meta
    - name: description
      content: Returns the transaction receipt given a transaction hash.
  - - meta
    - property: og:description
      content: Returns the transaction receipt given a transaction hash.

---

# getTransactionReceipt

Returns the [Transaction Receipt](/docs/glossary/terms#transaction-receipt) given a [Transaction](/docs/glossary/terms#transaction) hash.

## Usage

```ts
import { publicClient } from '.'
 
const transaction = await publicClient.getTransactionReceipt({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
/**
 * {
 *  blockHash: '0xaf1dadb8a98f1282e8f7b42cc3da8847bfa2cf4e227b8220403ae642e1173088',
 *  blockNumber: 15132008n,
 *  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *  ...
 *  status: 'success',
 * }
 */
```

## Returns

[`TransactionReceipt`](/docs/glossary/types#TODO)

The transaction receipt.

## Parameters

### hash

- **Type:** `'0x${string}'`

A transaction hash.

```ts
const transaction = await publicClient.getTransactionReceipt({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```
