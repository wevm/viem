---
description: Returns the signature for a given function or event definition.
---

# toSignature

Returns the signature for a given function or event definition.

## Install

```ts
import { toSignature } from 'viem'
```

## Usage

```ts twoslash
import { toSignature } from 'viem'

// from function definition
// @log: Output: ownerOf(uint256)
const signature_1 = toSignature('function ownerOf(uint256 tokenId)')

// from event definition
// @log: Output: Transfer(address,address,uint256)
const signature_2 = toSignature('event Transfer(address indexed from, address indexed to, uint256 amount)')

// from an `AbiFunction` on your contract ABI
const signature_3 = toSignature({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
// @log: Output: ownerOf(uint256)
})

// from an `AbiEvent` on your contract ABI
const signature_4 = toSignature({
  name: 'Transfer',
  type: 'event',
  inputs: [
    { name: 'address', type: 'address', indexed: true },
    { name: 'address', type: 'address', indexed: true },
    { name: 'uint256', type: 'uint256', indexed: false },
  ],
// @log: Output: Transfer(address,address,uint256)
})
```

## Returns

`string`

The signature as a string value.

## Parameters

### definition

- **Type:** `string | AbiEvent | AbiFunction`

The event or function definition to generate a signature for.
