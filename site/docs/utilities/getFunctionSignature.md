---
head:
  - - meta
    - property: og:title
      content: getFunctionSignature
  - - meta
    - name: description
      content: Returns the function signature for a given function definition.
  - - meta
    - property: og:description
      content: Returns the function signature for a given function definition.

---

# getFunctionSignature

Returns the function signature for a given function definition.

## Install

```ts
import { getFunctionSignature } from 'viem'
```

## Usage

```ts
import { getFunctionSignature } from 'viem'

const signature = getFunctionSignature('function ownerOf(uint256 tokenId)')
// ownerOf(uint256 tokenId)

const signature = getFunctionSignature('ownerOf(uint256)')
// ownerOf(uint256)

// or from an `AbiFunction` on your contract ABI
const signature = getFunctionSignature({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
})
// ownerOf(uint256)
```

## Returns

`string`

The signature as a string value.

## Parameters

### function

- **Type:** `string | AbiFunction`

The function to generate a signature for.
