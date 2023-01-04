# getSignature

Returns the function signature (4 byte encoding) for a given function definition.

## Install

```ts
import { getSignature } from 'viem'
```

## Usage

```ts
import { getSignature } from 'viem'

const signature = getSignature('function ownerOf(uint256 tokenId)')
// 0x6352211e

const signature = getSignature('ownerOf(uint256)')
// 0x6352211e
```

## Returns

`Hex`

The signature as a hex value.

## Arguments

### function

- **Type:** `string`

The function to generate a signature for.

