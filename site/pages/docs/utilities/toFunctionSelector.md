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
// @twoslash-cache: {"v":1,"hash":"1b07e41369929d89db3854244b92e81196a6b86c559f7e821b90c36d8341ae1f","data":"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"}
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

