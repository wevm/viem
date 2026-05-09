---
description: Returns the signature for a given event or event definition.
---

# toEventSignature

Returns the signature for a given event definition.

:::tip
This only returns the **event signature**. If you need the **full human-readable definition**, check out ABIType's [`formatAbiItem`](https://abitype.dev/api/human#formatabiitem-1).
:::

## Install

```ts
import { toEventSignature } from 'viem'
```

## Usage

```ts twoslash
import { toEventSignature } from 'viem'

// from event definition
const signature_1 = toEventSignature('event Transfer(address indexed from, address indexed to, uint256 amount)')
// @log: Output: Transfer(address,address,uint256)

// from an `AbiEvent` on your contract ABI
const signature_2 = toEventSignature({
  name: 'Transfer',
  type: 'event',
  inputs: [
    { name: 'address', type: 'address', indexed: true },
    { name: 'address', type: 'address', indexed: true },
    { name: 'uint256', type: 'uint256', indexed: false },
  ],
})
// @log: Output: Transfer(address,address,uint256)
```

## Returns

`string`

The signature as a string value.

## Parameters

### definition

- **Type:** `string | AbiEvent`

The event definition to generate a signature for.
