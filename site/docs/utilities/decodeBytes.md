# decodeBytes

Encodes a byte array (`Uint8Array`) to a string or hex value.

## Import

```ts
import { decodeBytes } from 'viem'
```

## Usage

```ts
import { decodeBytes } from 'viem'

decodeBytes(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), 
  'string'
)
// 'Hello world'

decodeBytes(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), 
  'hex'
)
// '0x48656c6c6f20576f726c6421'
```

## Returns

`string | Hex`

The targeted type.

## Arguments

### value

- **Type:** `Uint8Array`

The byte array to decode.

### to

- **Type:** `"string" | "hex"`

The output type.

## Shortcut Functions

### bytesToHex

- **Type:** `Hex`

Decodes a byte array to a hex value.

```ts
import { numberToHex } from 'viem'

bytesToHex(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])) // [!code focus:2]
// '0x48656c6c6f20576f726c6421'
```

### bytesToString

- **Type:** `Hex`

Decodes a byte array to a string.

```ts
import { numberToHex } from 'viem'

bytesToString(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])) // [!code focus:2]
// 'Hello world'
```
