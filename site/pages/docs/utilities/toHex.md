---
description: Encodes a string, number, boolean or byte array to a hex value value.
---

# toHex

Encodes a string, number, boolean or byte array to a hex value value.

Shortcut Functions: 

- [numberToHex](#numbertohex)
- [stringToHex](#stringtohex)
- [bytesToHex](#bytestohex)
- [boolToHex](#booltohex)

## Import

```ts
import { toHex } from 'viem'
```

## Usage

```ts
import { toHex } from 'viem'

toHex(420)
// "0x1a4"

toHex('Hello world')
// "0x48656c6c6f20776f726c642e"

toHex(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
)
// "0x48656c6c6f20576f726c6421"

toHex(true)
// "0x1"
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hex value.

## Parameters

### value

- **Type:** `string | number | bigint | ByteArray`

The value to hex encode.

```ts 
toHex(
  'Hello world' // [!code focus]
)
// '0x48656c6c6f20776f726c642e'
```

### options

```ts 
toHex(
  'Hello world', 
  { size: 32 } // [!code focus]
)
// '0x48656c6c6f20776f726c642e0000000000000000000000000000000000000000'
```

## Shortcut Functions

### numberToHex

- **Type:** `number | bigint`

Encodes a number value to a hex value.

```ts
import { numberToHex } from 'viem'

numberToHex(420)
// "0x1a4"

numberToHex(4206942069420694206942069420694206942069n)
// "0xc5cf39211876fb5e5884327fa56fc0b75"

numberToHex(420, { size: 32 })
// "0x00000000000000000000000000000000000000000000000000000000000001a4"

numberToHex(4206942069420694206942069420694206942069n, { size: 32 })
// "0x0000000000000000000000000000000c5cf39211876fb5e5884327fa56fc0b75"
```

### stringToHex

- **Type:** `string`

Encodes a UTF-8 string value to a hex value.

```ts
import { stringToHex } from 'viem'

stringToHex('Hello World!')
// "0x48656c6c6f20576f726c6421"

stringToHex('Hello World!', { size: 32 })
// "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"
```

### bytesToHex

- **Type:** `ByteArray`

Encodes a byte array to a hex value.

```ts
import { bytesToHex } from 'viem'

bytesToHex(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
)
// "0x48656c6c6f20576f726c6421"

bytesToHex(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
  { size: 32 }
)
// "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000"
```

### boolToHex

- **Type:** `boolean`

Encodes a boolean to a hex value.

```ts
import { boolToHex } from 'viem'

boolToHex(true)
// "0x1"

boolToHex(true, { size: 32 })
// "0x0000000000000000000000000000000000000000000000000000000000000001"
```
