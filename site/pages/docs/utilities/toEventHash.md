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
// @twoslash-cache: {"v":2,"hash":"9f46f1f022091662faa9c3ab9081f93242ec94c68b82c5cde050596e50cc8413","data":"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"}
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

