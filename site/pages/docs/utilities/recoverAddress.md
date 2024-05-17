---
description: Recovers the signing address from a hash & signature.
---

# recoverAddress

Recovers the original signing address from a hash & signature.

## Usage

```ts [example.ts]
import { recoverAddress } from 'viem'
 
const address = await recoverAddress({
  hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c'
})
// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

## Returns

[`Address`](/docs/glossary/types#address)

The signing address.

## Parameters

### hash

- **Type:** `string`

The hash that was signed.

```ts
const address = await recoverAddress({ 
  hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68', // [!code focus]
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c'
})
```

### signature

- **Type:** `Hex | ByteArray | Signature`

The signature of the hash.

```ts
const address = await recoverAddress({ 
  hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
  signature: '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c' // [!code focus]
})
```