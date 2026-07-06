---
description: Returns a section of the hex or byte array given a start/end bytes offset.
---

# slice

Returns a section of the hex or byte array given a start/end bytes offset.

## Install

```ts
import { slice } from 'viem'
```

## Usage

```ts
import { slice } from 'viem'

slice('0x0123456789', 1, 4)
// 0x234567

slice(new Uint8Array([1, 122, 51, 123]), 1, 3)
// Uint8Array [122, 51]
```

## Returns

`Hex | ByteArray`

The section of the sliced value.

## Parameters

### value

- **Type:** `Hex | ByteArray`

The hex or byte array to slice.

```ts
slice(
  '0x0123456789', // [!code focus]
  1,
  4
)
```

### start (optional)

- **Type:** `number`

The start offset (in bytes).

```ts
slice(
  '0x0123456789', 
  1 // [!code focus]
)
```

### end (optional)

- **Type:** `number`

The end offset (in bytes).

```ts
slice(
  '0x0123456789', 
  1,
  4 // [!code focus]
)
```

#### options.strict (optional)

- **Type:** `boolean`
- **Default:** `false`


Whether or not the end offset should be inclusive of the bounds of the data.

```ts
slice('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678', 0, 20, { strict: true })
// [SliceOffsetOutOfBoundsError] Slice ending at offset "20" is out-of-bounds (size: 19).

slice('0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 0, 20, { strict: true })
// 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
```

