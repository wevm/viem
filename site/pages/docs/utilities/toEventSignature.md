---
description: Returns the signature for a given event or event definition.
---

# toEventSignature

Returns the signature for a given event definition.

## Install

```ts
import { toEventSignature } from 'viem'
```

## Usage

```ts twoslash
import { toEventSignature } from 'viem'

// from event definition
// @log: Output: Transfer(address,address,uint256)
const signature_1 = toEventSignature('event Transfer(address indexed from, address indexed to, uint256 amount)')

// from an `AbiEvent` on your contract ABI
const signature_2 = toEventSignature({
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

- **Type:** `string | AbiEvent`

The event definition to generate a signature for.
