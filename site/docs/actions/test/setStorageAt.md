# setStorageAt

Writes to a slot of an account's storage.

## Import 

```ts
import { setStorageAt } from 'viem'
```

## Usage

```ts
import { setStorageAt } from 'viem'
import { testClient } from '.'
 
await setStorageAt(testClient, { // [!code focus:99]
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  index: 2,
  value: '0x0000000000000000000000000000000000000000000000000000000000000069'
})
```

## Configuration

### address

- **Type:** `Address`

The account address.

```ts
await setStorageAt(testClient, {
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79', // [!code focus]
  index: 2,
  value: '0x0000000000000000000000000000000000000000000000000000000000000069'
})
```

### index

- **Type:** `number | `0x${string}``

The storage slot (index).

```ts
await setStorageAt(testClient, {
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  index: 2, // [!code focus]
  value: '0x0000000000000000000000000000000000000000000000000000000000000069'
})
```

### value

- **Type:** `number`

The value to store as a 32 byte hex string.

```ts
await setStorageAt(testClient, {
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  index: 2,
  value: '0x0000000000000000000000000000000000000000000000000000000000000069' // [!code focus]
})
```