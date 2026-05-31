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
// @twoslash-cache: {"v":2,"hash":"d36c6ac96520db5d2521e643d59858825c5f46153bde76f3c3f911971bf0955b","data":"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"}
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
