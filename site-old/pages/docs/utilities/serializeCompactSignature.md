---
description: Serializes a compact signature into hex format.
---

# serializeCompactSignature

Serializes a [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact signature into hex format.

## Import

```ts
import { serializeCompactSignature } from 'viem'
```

## Usage

```ts
import { serializeCompactSignature } from 'viem'

serializeCompactSignature({ // [!code focus:8]
  r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
  yParityAndS:
    '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
})
// "0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064"
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hex formatted signature.

## Parameters

### compactSignature

The compact signature.

- **Type:** [`CompactSignature`](/docs/glossary/types#CompactSignature)
