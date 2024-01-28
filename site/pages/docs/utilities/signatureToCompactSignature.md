---
description: Parses a signature into a compact signature.
---

# signatureToCompactSignature

Parses a signature into a [EIP-2098](https://eips.ethereum.org/EIPS/eip-2098) compact signature.

## Import

```ts
import { signatureToCompactSignature } from 'viem'
```

## Usage

```ts
import { signatureToCompactSignature, Signature } from 'viem'

signatureToCompactSignature({  // [!code focus:9]
  r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
  s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064' 
  yParity: 0
})
// {
//   r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
//   yParityAndS: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
// }
```

## Returns

[`CompactSignature`](/docs/glossary/types#compactsignature)

The compact signature.

## Parameters

### signature

The signature.

- **Type:** [`Signature`](/docs/glossary/types#signature)
