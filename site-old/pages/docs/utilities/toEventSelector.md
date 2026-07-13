---
description: Returns the event selector for a given event definition.
---

# toEventSelector

Returns the event selector for a given event definition.

## Install

```ts
import { toEventSelector } from 'viem'
```

## Usage

```ts twoslash
import { toEventSelector } from 'viem'

const selector_1 = toEventSelector('Transfer(address,address,uint256)')
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

const selector_2 = toEventSelector('Transfer(address indexed from, address indexed to, uint256 amount)')
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

// or from an `AbiEvent` on your contract ABI
const selector_3 = toEventSelector({
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

The selector as a hex value.

## Parameters

### event

- **Type:** `string |`[`AbiEvent`](https://abitype.dev/api/types#abievent)

The event to generate a selector for.

