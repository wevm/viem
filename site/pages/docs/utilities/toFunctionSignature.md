---
description: Returns the signature for a given function definition.
---

# toFunctionSignature

Returns the signature for a given function definition.

:::tip
This only returns the **function signature**. If you need the **full human-readable definition**, check out ABIType's [`formatAbiItem`](https://abitype.dev/api/human#formatabiitem-1).
:::

## Install

```ts
import { toFunctionSignature } from 'viem'
```

## Usage

```ts twoslash
import { toFunctionSignature } from 'viem'

// from function definition
const signature_1 = toFunctionSignature('function ownerOf(uint256 tokenId)')
// @log: Output: ownerOf(uint256)

// from an `AbiFunction` on your contract ABI
const signature_2 = toFunctionSignature({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
})
// @log: Output: ownerOf(uint256)
```

## Returns

`string`

The signature as a string value.

## Parameters

### definition

- **Type:** `string | AbiFunction`

The function definition to generate a signature for.
