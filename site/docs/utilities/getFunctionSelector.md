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
```

## Returns

`Hex`

The selector as a hex value.

## Parameters

### function

- **Type:** `string`

The function to generate a selector for.

