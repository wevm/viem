---
description: Returns the function selector (4 byte encoding) for a given function definition.
---

# toFunctionSelector

Returns the function selector (4 byte encoding) for a given function definition.

## Install

```ts
import { toFunctionSelector } from 'viem'
```

## Usage

```ts twoslash
import { toFunctionSelector } from 'viem'

const selector_1 = toFunctionSelector('function ownerOf(uint256 tokenId)')
// @log: Output: 0x6352211e

const selector_2 = toFunctionSelector('ownerOf(uint256)')
// @log: Output: 0x6352211e

// or from an `AbiFunction` on your contract ABI
const selector_3 = toFunctionSelector({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
})
// @log: Output: 0x6352211e
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The selector as a hex value.

## Parameters

### function

- **Type:** `string |`[`AbiFunction`](https://abitype.dev/api/types#abifunction)

The function to generate a selector for.

