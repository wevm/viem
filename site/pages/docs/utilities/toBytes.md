---
description: Encodes a string, hex value, number or boolean to a byte array.
---

# toBytes

Encodes a string, hex value, number or boolean to a byte array.

Shortcut Functions:

- [hexToBytes](#hextobytes)
- [stringToBytes](#stringtobytes)
- [numberToBytes](#numbertobytes)
- [boolToBytes](#booltobytes)

## Import

```ts
import { toBytes } from 'viem'
```

## Usage

```ts
import { toBytes } from 'viem'

toBytes('Hello world')
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

toBytes('0x48656c6c6f20576f726c6421')
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

toBytes(420)
// Uint8Array([1, 164])

toBytes(true)
// Uint8Array([1])
```

## Returns

`ByteArray`

The byte array represented as a `Uint8Array`.

## Parameters

### value

- **Type:** `string | Hex`

The value to encode as bytes.

```ts 
toBytes(
  'Hello world' // [!code focus]
)
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
```

### options

```ts 
toBytes(
  'Hello world', 
  { size: 32 } // [!code focus]
)
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
```

## Shortcut Functions

### hexToBytes

- **Type:** `Hex`

Encodes a hex value to a byte array.

```ts
import { hexToBytes } from 'viem'

hexToBytes('0x48656c6c6f20576f726c6421') // [!code focus:2]
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

hexToBytes('0x48656c6c6f20576f726c6421', { size: 32 }) // [!code focus:2]
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
```

### stringToBytes

- **Type:** `Hex`

Encodes a string to a byte array.

```ts
import { stringToBytes } from 'viem'

stringToBytes('Hello world') // [!code focus:2]
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

stringToBytes('Hello world', { size: 32 }) // [!code focus:2]
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
```

### numberToBytes

- **Type:** `number | bigint`

Encodes a number to a byte array.

```ts
import { numberToBytes } from 'viem'

numberToBytes(420) // [!code focus:2]
// Uint8Array([1, 164])

numberToBytes(420, { size: 32 }) // [!code focus:2]
// Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 164])
```

### boolToBytes

- **Type:** `boolean`

Encodes a boolean to a byte array.

```ts
import { boolToBytes } from 'viem'

boolToBytes(true) // [!code focus:2]
// Uint8Array([1])

boolToBytes(true, { size: 32 }) // [!code focus:2]
// Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
```
