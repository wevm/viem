---
description: Returns the hash (of the event signature) for a given event definition.
---

# toEventHash

Returns the hash (of the event signature) for a given event definition.

## Install

```ts
import { toEventHash } from 'viem'
```

## Usage

```ts twoslash
import { toEventHash } from 'viem'

const hash_1 = toEventHash('event Transfer(address,address,uint256)')
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

const hash_2 = toEventHash({
  name: 'Transfer',
  type: 'event',
  inputs: [
    { name: 'from', type: 'address', indexed: true },
    { name: 'to', type: 'address', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false },
  ],
})
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hash of the event signature.

## Parameters

### event

- **Type:** `string` | [`AbiEvent`](https://abitype.dev/api/types#abievent)

The event to generate a hash for.

