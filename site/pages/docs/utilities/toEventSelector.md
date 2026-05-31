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
// @twoslash-cache: {"v":1,"hash":"d1d2c8ed5b5b0c8dd848fb0a30e44862c4c5b8ba82a30e57b3054422333bed4b","data":"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="}
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

