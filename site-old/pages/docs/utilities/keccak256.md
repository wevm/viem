---
description: Calculates the Keccak256 hash of a byte array.
---

# keccak256

Calculates the [Keccak256](https://en.wikipedia.org/wiki/SHA-3) hash of a byte array or hex value.

This function is a re-export of `keccak_256` from [`@noble/hashes`](https://github.com/paulmillr/noble-hashes) – an audited & minimal JS hashing library.

## Install

```ts
import { keccak256 } from 'viem'
```

## Usage

```ts
import { keccak256 } from 'viem'

keccak256(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
// 0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0

keccak256('0xdeadbeef')
// 0xd4fd4e189132273036449fc9e11198c739161b4c0116a9a2dccdfa1c492006f1

// hash utf-8 string
keccak256(toHex('hello world'))
// 0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0
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
import { keccak256 } from 'viem'

keccak256(
  new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33],
  'bytes' // [!code focus]
)
// Uint8Array [62, 162, 241, 208, 171, 243, 252, 102, 207, 41, 238, 187, 112, 203, 212, 231, 254, 118, 46, 248, 160, 155, 204, 6, 200, 237, 246, 65, 35, 10, 254, 192] // [!code focus]
```