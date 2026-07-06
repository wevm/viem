---
description: Hashes a message in EIP-191 format.
---

# hashMessage

Calculates an Ethereum-specific hash in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.

## Import

```ts
import { hashMessage } from 'viem'
```

## Usage

```ts
import { hashMessage } from 'viem'

hashMessage('hello world') // [!code focus:2]
// 0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68

// Hash a hex data value.  // [!code focus:3]
hashMessage({ raw: '0x68656c6c6f20776f726c64' })
// 0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68

// Hash a bytes data value.  // [!code focus:6]
hashMessage({ 
  raw: Uint8Array.from([
    104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
  ])})
// 0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hashed message.

## Parameters

### message

Message to hash.

- **Type:** `string | { raw: Hex | ByteArray }`

 
