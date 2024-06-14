---
description: Serializes a ERC-6492 flavoured signature into hex format.
---

# serializeErc6492Signature

Serializes a [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) flavoured signature into hex format.

## Import

```ts
import { serializeErc6492Signature } from 'viem/experimental'
```

## Usage

```ts twoslash
import { serializeErc6492Signature } from 'viem/experimental'

serializeErc6492Signature({ // [!code focus:99]
  address: '0xcafebabecafebabecafebabecafebabecafebabe',
  data: '0xdeadbeef',
  signature: '0x41a461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
})
// "0x000000000000000000000000cafebabecafebabecafebabecafebabecafebabe000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041a461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hex formatted signature.

## Parameters

### address

- **Type:** `Address`

The ERC-4337 Account Factory or preparation address to use for counterfactual verification.

### data

- **Type:** `Hex`

Calldata to pass to deploy the ERC-4337 Account (if not deployed) for counterfactual verification.

### signature

- **Type:** `Hex`

The original signature.