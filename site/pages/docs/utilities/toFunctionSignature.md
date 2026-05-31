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
// @twoslash-cache: {"v":1,"hash":"29171568567ac8360ceded0faab760ef900b98c17420a679a60fa587b726df00","data":"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"}
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
