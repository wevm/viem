---
description: Encodes a hex value or byte array into a RLP encoded value.
---

# toRlp

Encodes a hex value or byte array into a [Recursive-Length Prefix (RLP)](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) encoded value.

## Import

```ts
import { toRlp } from 'viem'
```

## Usage

```ts
import { toRlp } from 'viem'

toRlp('0x123456789')
// "0x850123456789"

toRlp(['0x7f', '0x7f', '0x8081e8'])
// "0xc67f7f838081e8"

toRlp(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))
// "0x89010203040506070809"

toRlp('0x123456789', 'bytes')
// Uint8Array [133, 1, 35, 69, 103, 137]
```

## Returns

`Hex | ByteArray`

The hex value or byte array.

## Parameters

### value

- **Type:** `Hex | ByteArray`

The value to RLP encode.

### to

- **Type:** `"bytes" | "hex"`
- **Default:** `"hex"`

The output type.

```ts
toRlp('0x123456789', 'bytes')
// Uint8Array [133, 1, 35, 69, 103, 137]
```
