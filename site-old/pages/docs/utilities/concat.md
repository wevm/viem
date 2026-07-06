---
description: Concatenates a set of hex values or byte arrays.
---

# concat

Concatenates a set of hex values or byte arrays.

## Install

```ts
import { concat } from 'viem'
```

## Usage

```ts
import { concat } from 'viem'

concat(['0x00000069', '0x00000420'])
// 0x0000006900000420

concat([new Uint8Array([69]), new Uint8Array([420])])
// Uint8Array [69, 420]
```

## Returns

`Hex | ByteArray`

The concatenated value.