---
description: Parses a hex-formatted ERC-6492 flavoured signature.
---

# parseErc6492Signature

Parses a hex-formatted [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) flavoured signature.

If the signature is not in ERC-6492 format, then the underlying (original) signature is returned.

## Import

```ts
import { parseErc6492Signature } from 'viem/experimental'
```

## Usage

```ts twoslash
import { parseErc6492Signature } from 'viem/experimental'

const { // [!code focus:99]
  address,
  data,
  signature,
} = parseErc6492Signature('0x000000000000000000000000cafebabecafebabecafebabecafebabecafebabe000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041a461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492')
/**
 * {
 *   address: '0xCafEBAbECAFEbAbEcaFEbabECAfebAbEcAFEBaBe',
 *   data: '0xdeadbeef',
 *   signature: '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b'
 * }
 */
```

## Returns

`ParseErc6492SignatureReturnType`

The ERC-6492 signature components.

## Parameters

### signature

- **Type:** [`Hex`](/docs/glossary/types#hex)

The ERC-6492 signature in hex format.