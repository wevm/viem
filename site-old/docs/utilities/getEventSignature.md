---
head:
  - - meta
    - property: og:title
      content: getEventSignature
  - - meta
    - name: description
      content: Returns the event signature for a given event definition.
  - - meta
    - property: og:description
      content: Returns the event signature for a given event definition.

---

# getEventSignature

Returns the event signature for a given event definition.

## Install

```ts
import { getEventSignature } from 'viem'
```

## Usage

```ts
import { getEventSignature } from 'viem'

const signature = getEventSignature('event Transfer(address indexed from, address indexed to, uint256 amount)')
// Transfer(address,address,uint256)

// or from an `AbiEvent` on your contract ABI
const signature = getEventSignature({
  name: 'Transfer',
  type: 'event',
  inputs: [
    { name: 'address', type: 'address', indexed: true },
    { name: 'address', type: 'address', indexed: true },
    { name: 'uint256', type: 'uint256', indexed: false },
  ],
})
// Transfer(address,address,uint256)
```

## Returns

`string`

The signature as a string value.

## Parameters

### event

- **Type:** `string | AbiEvent`

The event to generate a signature for.
