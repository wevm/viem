---
head:
  - - meta
    - property: og:title
      content: getFunctionSelector
  - - meta
    - name: description
      content: Returns the function selector (4 byte encoding) for a given function definition.
  - - meta
    - property: og:description
      content: Returns the function selector (4 byte encoding) for a given function definition.

---

# getFunctionSelector

Returns the function selector (4 byte encoding) for a given function definition.

## Install

```ts
import { getFunctionSelector } from 'viem'
```

## Usage

```ts
import { getFunctionSelector } from 'viem'

const selector = getFunctionSelector('function ownerOf(uint256 tokenId)')
// 0x6352211e

const selector = getFunctionSelector('ownerOf(uint256)')
// 0x6352211e

// or from an `AbiFunction` on your contract ABI
const selector = getFunctionSelector({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
})
// 0x6352211e
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The selector as a hex value.

## Parameters

### function

- **Type:** `string |`[`AbiFunction`](https://abitype.dev/api/types.html#abifunction)

The function to generate a selector for.

