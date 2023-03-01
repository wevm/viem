---
head:
  - - meta
    - property: og:title
      content: fromBytes
  - - meta
    - name: description
      content: Decodes a byte array to a string, hex value, boolean or number.
  - - meta
    - property: og:description
      content: Decodes a byte array to a string, hex value, boolean or number.

---

# fromBytes

Decodes a byte array to a string, hex value, boolean or number.

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

### to

- **Type:** `"string" | "hex" | "number" | "bigint" | "boolean"`

The output type.

## Shortcut Functions

### bytesToHex

- **Type:** `Hex`

Decodes a byte array to a hex value.

```ts
import { bytesToHex } from 'viem'

bytesToHex(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])) // [!code focus:2]
// '0x48656c6c6f20576f726c6421'
```

### bytesToString

- **Type:** `Hex`

Decodes a byte array to a string.

```ts
import { bytesToString } from 'viem'

bytesToString(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])) // [!code focus:2]
// 'Hello world'
```

### bytesToNumber

- **Type:** `number`

Decodes a byte array to a number.

```ts
import { bytesToNumber } from 'viem'

bytesToNumber(new Uint8Array([1, 164])) // [!code focus:2]
// 420
```

### bytesToBigint

- **Type:** `number`

Decodes a byte array to a number.

```ts
import { bytesToBigint } from 'viem'

bytesToBigint(new Uint8Array([12, 92, 243, 146, 17, 135, 111, 181, 229, 136, 67, 39, 250, 86, 252, 11, 117])) // [!code focus:2]
// 4206942069420694206942069420694206942069n
```

### bytesToBool

- **Type:** `boolean`

Decodes a byte array to a boolean.

```ts
import { bytesToBool } from 'viem'

bytesToBool(new Uint8Array([1])) // [!code focus:2]
// true
```
