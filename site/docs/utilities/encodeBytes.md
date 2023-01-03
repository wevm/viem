# encodeBytes

Encodes a string or hex value to a byte array (`Uint8Array`).

## Import

```ts
import { encodeBytes } from 'viem'
```

## Usage

```ts
import { encodeBytes } from 'viem'

encodeBytes('Hello world')
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

encodeBytes('0x48656c6c6f20576f726c6421')
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
```

## Returns

`Uint8Array`

The byte array represented as a `Uint8Array`.

## Arguments

### value

- **Type:** `string | Hex`

The value to encode as bytes.

## Shortcut Functions

### hexToBytes

- **Type:** `Hex`

Encodes a hex value to a byte array.

```ts
import { numberToHex } from 'viem'

hexToBytes('0x48656c6c6f20576f726c6421') // [!code focus:2]
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
```

### stringToBytes

- **Type:** `Hex`

Encodes a string to a byte array.

```ts
import { numberToHex } from 'viem'

stringToBytes('Hello world') // [!code focus:2]
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
```
