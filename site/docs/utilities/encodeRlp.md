# encodeRlp

Encodes a hex value or byte array into a [Recursive-Length Prefix (RLP)](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/enc) encoded value.

## Import

```ts
import { encodeRlp } from 'viem'
```

## Usage

```ts
import { encodeRlp } from 'viem'

encodeRlp('0x123456789')
// "0x850123456789"

encodeRlp(['0x7f', '0x7f', '0x8081e8'])
// "0xc67f7f838081e8"

encodeRlp(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))
// "0x89010203040506070809"

encodeRlp('0x123456789', 'bytes')
// Uint8Array [133, 1, 35, 69, 103, 137]
```

## Returns

`Hex | ByteArray`

The hex value or byte array.

## Arguments

### value

- **Type:** `Hex | ByteArray`

The value to RLP encode.

### to

- **Type:** `"bytes" | "hex"`
- **Default:** `"hex"`

The output type.

```ts
encodeRlp('0x123456789', 'bytes')
// Uint8Array [133, 1, 35, 69, 103, 137]
```
