---
description: Calculates the Ripemd160 hash of a byte array.
---

# ripemd160

Calculates the [Ripemd160](https://en.wikipedia.org/wiki/RIPEMD) hash of a byte array or hex value.

This function is a re-export of `ripemd160` from [`@noble/hashes`](https://github.com/paulmillr/noble-hashes) – an audited & minimal JS hashing library.

## Install

```ts
import { ripemd160 } from 'viem'
```

## Usage

```ts
import { ripemd160 } from 'viem'

ripemd160(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
// 0x8476ee4631b9b30ac2754b0ee0c47e161d3f724c

ripemd160('0xdeadbeef')
// 0x226821c2f5423e11fe9af68bd285c249db2e4b5a
```

## Returns

`Hex | ByteArray`

The hashed value.

## Parameters

### value

- **Type:** `Hex | ByteArray`

The hex value or byte array to hash.

### to

- **Type:** `"bytes" | "hex"`
- **Default:** `"hex"`

The output type.

```ts
import { ripemd160 } from 'viem'

ripemd160(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33],
  'bytes' // [!code focus]
)
// Uint8Array [132, 118, 238, 70, 49, 185, 179, 10, 194, 117, 75, 14, 224, 196, 126, 22, 29, 63, 114, 76] // [!code focus]
```