---
head:
  - - meta
    - property: og:title
      content: setStorageAt
  - - meta
    - name: description
      content: Writes to a slot of an account's storage.
  - - meta
    - property: og:description
      content: Writes to a slot of an account's storage.

---

# setStorageAt

Writes to a slot of an account's storage.

## Usage

```ts
import { testClient } from '.'
 
await testClient.setStorageAt({ // [!code focus:99]
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  index: 2,
  value: '0x0000000000000000000000000000000000000000000000000000000000000069'
})
```

## Parameters

### address

- **Type:** `Address`

The account address.

```ts
await testClient.setStorageAt({
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79', // [!code focus]
  index: 2,
  value: '0x0000000000000000000000000000000000000000000000000000000000000069'
})
```

### index

- **Type:** ``number | `0x${string}` ``

The storage slot (index). Can either be a number or hash value.

```ts
await testClient.setStorageAt({
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  index: '0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49', // [!code focus]
  value: '0x0000000000000000000000000000000000000000000000000000000000000069'
})
```

### value

- **Type:** `number`

The value to store as a 32 byte hex string.

```ts
await testClient.setStorageAt({
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  index: 2,
  value: '0x0000000000000000000000000000000000000000000000000000000000000069' // [!code focus]
})
```