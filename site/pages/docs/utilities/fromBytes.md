---
description: Decodes a byte array to a string, hex value, boolean or number.
---

# fromBytes

Decodes a byte array to a string, hex value, boolean or number.

Shortcut Functions:

- [bytesToHex](#bytestohex)
- [bytesToString](#bytestostring)
- [bytesToNumber](#bytestonumber)
- [bytesToBigInt](#bytestobigint)
- [bytesToBool](#bytestobool)

## Import

```ts
import { fromBytes } from 'viem'
```

## Usage

```ts
import { fromBytes } from 'viem'

fromBytes(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), 
  'string'
)
// 'Hello world'

fromBytes(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), 
  'hex'
)
// '0x48656c6c6f20576f726c6421'

fromBytes(new Uint8Array([1, 164]), 'number')
// 420

fromBytes(new Uint8Array([1]), 'boolean')
// true
```

## Returns

`string | Hex | number | bigint | boolean`

The targeted type.

## Parameters

### value

- **Type:** `ByteArray`

The byte array to decode.

### toOrOptions

- **Type:** `"string" | "hex" | "number" | "bigint" | "boolean" | Options`

The output type or options.

```ts 
fromBytes(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), 
  'string' // [!code focus]
)
// 'Hello world'
```

```ts 
fromBytes(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 
  { // [!code focus]
    size: 32, // [!code focus]
    to: 'string' // [!code focus]
  } // [!code focus]
)
// 'Hello world'
```

## Shortcut Functions

### bytesToHex

- **Type:** `Hex`

Decodes a byte array to a hex value.

```ts
import { bytesToHex } from 'viem'

bytesToHex( // [!code focus:4]
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
)
// '0x48656c6c6f20576f726c6421'

bytesToHex( // [!code focus:5]
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 
  { size: 32 }
)
// '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
```

### bytesToString

- **Type:** `Hex`

Decodes a byte array to a string.

```ts
import { bytesToString } from 'viem'

bytesToString( // [!code focus:4]
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
)
// 'Hello world'

bytesToString( // [!code focus:5]
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 
  { size: 32 }
)
// 'Hello world'
```

### bytesToNumber

- **Type:** `number`

Decodes a byte array to a number.

```ts
import { bytesToNumber } from 'viem'

bytesToNumber(new Uint8Array([1, 164])) // [!code focus:2]
// 420

bytesToNumber( // [!code focus:5]
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 164]), 
  { size: 32 }
)
// 420
```

### bytesToBigInt

- **Type:** `number`

Decodes a byte array to a number.

```ts
import { bytesToBigInt } from 'viem'

bytesToBigInt( // [!code focus:4]
  new Uint8Array([12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252, 11, 117])
)
// 4206942069420694206942069420694206942069n

bytesToBigInt( // [!code focus:5]
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252, 11, 117]),
  { size: 32 }
)
// 4206942069420694206942069420694206942069n
```

### bytesToBool

- **Type:** `boolean`

Decodes a byte array to a boolean.

```ts
import { bytesToBool } from 'viem'

bytesToBool(new Uint8Array([1])) // [!code focus:2]
// true

bytesToBool( // [!code focus:5]
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]),
  { size: 32 }
) 
// true
```
