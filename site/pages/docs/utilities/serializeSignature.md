---
description: Serializes a structured signature into hex format.
---

# serializeSignature

Serializes a structured signature into hex format.

## Import

```ts
import { serializeSignature } from 'viem'
```

## Usage

```ts
import { serializeSignature } from 'viem'

serializeSignature({
  r: '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf',
  s: '0x4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db8',
  yParity: 1
}) // [!code focus:8]
// "0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c"
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hex formatted signature.

## Parameters

### signature

The signature.

- **Type:** [`Signature`](/docs/glossary/types#signature)
