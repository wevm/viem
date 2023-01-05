# decodeHex

Decodes a hex value to a string, number or byte array.

## Import

```ts
import { decodeHex } from 'viem'
```

## Usage

```ts
import { decodeHex } from 'viem'

decodeHex('0x1a4', 'number')
// 420

decodeHex('0xc5cf39211876fb5e5884327fa56fc0b75', 'bigint')
// 4206942069420694206942069420694206942069n

decodeHex('0x48656c6c6f20776f726c642e', 'string')
// "Hello world"

decodeHex('0x48656c6c6f20576f726c6421', 'bytes')
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])

decodeHex('0x1', 'boolean')
// true
```

## Returns

`string | bigint | number | Uint8Array`

The targeted type.

## Arguments

### hex

- **Type:** `Hex`

The hex value to decode.

### to

- **Type:** `"string" | "bigint" | "number" | "bytes" | "boolean"`

The output type.

## Shortcut Functions

### hexToNumber

- **Type:** `Hex`

Decodes a hex value to a number.

```ts
import { hexToNumber } from 'viem'

hexToNumber('0x1a4')
// 420
```

### hexToBigInt

- **Type:** `Hex`

Decodes a hex value to a bigint.

```ts
import { hexToBigInt } from 'viem'

hexToBigInt('0xc5cf39211876fb5e5884327fa56fc0b75')
// 4206942069420694206942069420694206942069n
```

### hexToString

- **Type:** `Hex`

Decodes a hex value to a string.

```ts
import { hexToString } from 'viem'

hexToString('0x48656c6c6f20576f726c6421')
// "Hello World!"
```

### hexToBytes

- **Type:** `Hex`

Decodes a hex value to a byte array.

```ts
import { hexToBytes } from 'viem'

hexToBytes('0x48656c6c6f20576f726c6421')
// Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
```

### hexToBool

- **Type:** `Hex`

Decodes a hex value to a boolean.

```ts
import { hexToBytes } from 'viem'

hexToBytes('0x1')
// true
```
