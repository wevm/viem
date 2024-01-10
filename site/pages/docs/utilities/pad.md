---
description: Pads a hex value or byte array with leading or trailing zeros.
---

# pad

Pads a hex value or byte array with leading or trailing zeros.

## Install

```ts
import { pad } from 'viem'
```

## Usage

By default, `pad` will pad a value with leading zeros up to 32 bytes (64 hex chars).

```ts
import { pad } from 'viem'

pad('0xa4e12a45')
// 0x00000000000000000000000000000000000000000000000000000000a4e12a45

pad(new Uint8Array([1, 122, 51, 123]))
// Uint8Array [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,122,51,123]
```

## Returns

`Hex | ByteArray`

The value with padded zeros.

## Parameters

### dir

- **Type:** `"left" | "right"`
- **Default:** `"left"`

The direction in which to pad the zeros – either leading (left), or trailing (right).

```ts
pad('0xa4e12a45', {
  dir: 'right'
})
// 0xa4e12a4500000000000000000000000000000000000000000000000000000000
```

### size

- **Type:** `number`
- **Default:** `32`

Size (in bytes) of the targeted value.

```ts
pad('0xa4e12a45', {
  size: 16
})
// 0x000000000000000000000000a4e12a45
```

