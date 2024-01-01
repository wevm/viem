---
description: Decodes a RLP value into a decoded hex value or byte array.
---

# fromRlp

Decodes a [Recursive-Length Prefix (RLP)](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp) value into a decoded hex value or byte array.

## Import

```ts
import { fromRlp } from 'viem'
```

## Usage

```ts
import { fromRlp } from 'viem'

fromRlp('0x850123456789', 'hex')
// "0x123456789"

fromRlp('0xc67f7f838081e8', 'hex')
// ['0x7f', '0x7f', '0x8081e8']

fromRlp('0x89010203040506070809', 'bytes')
//  Uint8Array [1, 2, 3, 4, 5, 6, 7, 8, 9]

fromRlp(new Uint8Array ([133, 1, 35, 69, 103, 137]), 'hex')
// "0x123456789"
```

## Returns

`Hex | ByteArray`

The hex value or byte array.

## Parameters

### value

- **Type:** `Hex | ByteArray`

The RLP value to decode.

### to

- **Type:** `"bytes" | "hex"`

The output type.
