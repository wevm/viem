---
head:
  - - meta
    - property: og:title
      content: dropTransaction
  - - meta
    - name: description
      content: Removes a transaction from the mempool.
  - - meta
    - property: og:description
      content: Removes a transaction from the mempool.

---

# dropTransaction

Remove a transaction from the mempool.

## Usage

```ts
import { testClient } from '.'
 
await testClient.dropTransaction({ // [!code focus:4]
  hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364'
})
```

## Parameters

### hash

- **Type:** [`Hash`](/docs/glossary/types#hash)

The hash of the transaction.

```ts
await testClient.dropTransaction({
  hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364', // [!code focus]
})
```
