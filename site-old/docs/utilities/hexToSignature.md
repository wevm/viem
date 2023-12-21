---
head:
  - - meta
    - property: og:title
      content: hexToSignature
  - - meta
    - name: description
      content: Parses a hex formatted signature into a structured signature.
  - - meta
    - property: og:description
      content: Parses a hex formatted signature into a structured signature.

---

# hexToSignature

Parses a hex formatted signature into a structured ("split") signature.

## Import

```ts
import { hexToSignature } from 'viem'
```

## Usage

```ts
import { hexToSignature } from 'viem'

hexToSignature('0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c') // [!code focus:8]
/**
 * {
 *   r: '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf',
 *   s: '0x4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db8',
 *   v: 28n
 * }
 */
```

## Returns

[`Signature`](/docs/glossary/types#signature)

The structured ("split") signature.

## Parameters

### signatureHex

The signature in hex format.

- **Type:** [`Hex`](/docs/glossary/types#hex)
