---
head:
  - - meta
    - property: og:title
      content: setCoinbase
  - - meta
    - name: description
      content: Sets the coinbase address to be used in new blocks.
  - - meta
    - property: og:description
      content: Sets the coinbase address to be used in new blocks.

---

# setCoinbase

Sets the coinbase address to be used in new blocks.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setCoinbase({ // [!code focus:99]
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
})
```

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The coinbase address.

```ts
await testClient.setCoinbase({
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79', // [!code focus]
})
```
