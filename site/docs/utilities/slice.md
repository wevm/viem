# slice

Returns a section of the hex or byte array given a start/end bytes offset.

## Install

```ts
import { slice } from 'viem'
```

## Usage

```ts
import { slice } from 'viem'

sliceHex('0x0123456789', 1, 4)
// 0x234567

slice(new Uint8Array([1, 122, 51, 123]), 1, 3)
// Uint8Array [122, 51]
```

## Returns

`Hex | ByteArray`

The section of the sliced value.

## Arguments

### value

- **Type:** `Hex | ByteArray`

The hex or byte array to slice.

```ts
sliceHex(
  '0x0123456789', // [!code focus]
  1,
  4
)
```

### start (optional)

- **Type:** `number`

The start offset (in bytes).

```ts
sliceHex(
  '0x0123456789', 
  1 // [!code focus]
)
```

### end (optional)

- **Type:** `number`

The end offset (in bytes).

```ts
sliceHex(
  '0x0123456789', 
  1,
  4 // [!code focus]
)
```

