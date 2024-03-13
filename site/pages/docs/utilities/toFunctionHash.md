---
description: Returns the hash (of the function signature) for a given function definition.
---

# toFunctionHash

Returns the hash (of the function signature) for a given function definition.

## Install

```ts
import { toFunctionHash } from 'viem'
```

## Usage

```ts twoslash
import { toFunctionHash } from 'viem'

const hash_1 = toFunctionHash('function ownerOf(uint256)')
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

// or from an `AbiEvent` on your contract ABI
const hash_2 = toFunctionHash({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
})
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hash of the function signature.

## Parameters

### function

- **Type:** `string` | [`AbiFunction`](https://abitype.dev/api/types#abifunction)

The function to generate a hash for.

