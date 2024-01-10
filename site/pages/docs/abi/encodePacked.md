---
description: Generates ABI encoded data.
---

# encodePacked

Generates [ABI non-standard packed encoded data](https://docs.soliditylang.org/en/v0.8.18/abi-spec#non-standard-packed-mode) given a set of solidity types compatible with packed encoding.

## Import

```ts
import { encodePacked } from 'viem'
```

## Usage

```ts
encodePacked(
  ['address', 'string', 'bytes16[]'], 
  [
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
    'hello world',
    ['0xdeadbeefdeadbeefdeadbeefdeadbeef', '0xcafebabecafebabecafebabecafebabe']
  ]
)
// 0xd8da6bf26964af9d7eed9e03e53415d37aa9604568656c6c6f20776f726c64deadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000000cafebabecafebabecafebabecafebabe00000000000000000000000000000000
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The encoded packed data.

## Parameters

### types

- **Type**: `PackedAbiType[]`

Set of ABI types to pack encode.

```ts
encodePacked(
  ['address', 'string', 'bytes16[]'], // [!code focus]
  [
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
    'hello world',
    ['0xdeadbeefdeadbeefdeadbeefdeadbeef', '0xcafebabecafebabecafebabecafebabe']
  ]
)
```

### values

- **Type**: [`AbiParametersToPrimitiveTypes<PackedAbiType[]>`](/docs/glossary/terms#abiparameterstoprimitivetypes)

The set of primitive values that correspond to the ABI types defined in `types`.

```ts
encodePacked(
  ['address', 'string', 'bytes16[]'],
  [ // [!code focus:5]
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
    'hello world',
    ['0xdeadbeefdeadbeefdeadbeefdeadbeef', '0xcafebabecafebabecafebabecafebabe']
  ]
)
```