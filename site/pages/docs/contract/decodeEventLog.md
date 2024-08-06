---
description: Decodes ABI encoded event topics & data.
---

# decodeEventLog

Decodes ABI encoded event topics & data (from an [Event Log](/docs/glossary/terms#event-log)) into an event name and structured arguments (both indexed & non-indexed).

## Install

```ts
import { decodeEventLog } from 'viem'
```

## Usage

:::code-group

```ts [example.ts]
import { decodeEventLog } from 'viem'
import { wagmiAbi } from './abi.ts'

const topics = decodeEventLog({
  abi: wagmiAbi,
  data: '0x0000000000000000000000000000000000000000000000000000000000000001',
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
/**
 *  {
 *    eventName: 'Transfer',
 *    args: {
 *      from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
 *      value: 1n
 *    }
 *  }
 */
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      { indexed: true, name: 'to', type: 'address' },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  ...
] as const;
```

:::

### Partial Decode

By default, if the `topics` and `data` does not conform to the ABI (a mismatch between the number of indexed/non-indexed arguments), `decodeEventLog` will throw an error.

For example, the following will throw an error as there is a mismatch in non-`indexed` arguments & `data` length.

```ts
decodeEventLog({
  abi: parseAbi(['event Transfer(address indexed, address, uint256)']), // [!code focus]
  // `data` should be 64 bytes, but is only 32 bytes. // [!code focus]
  data: '0x0000000000000000000000000000000000000000000000000000000000000001', // [!code focus]
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  ]
})
// [DecodeLogDataMismatch]: Data size of 32 bytes is too small for non-indexed event parameters.
```

It is possible for `decodeEventLog` to try and partially decode the Log, this can be done by setting the `strict` argument to `false`:

```ts 
decodeEventLog({ // [!code focus]
  abi: parseAbi(['event Transfer(address indexed, address, uint256)']), // [!code focus]
  data: '0x0000000000000000000000000000000000000000000000000000000000000001', // [!code focus]
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  ],
  strict: false // [!code ++]
})
/**
 * {
 *   eventName: 'Transfer',
 *   args: ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266']
 * }
 */
```

## Return Value

```ts
{
  eventName: string;
  args: Inferred;
}
```

Decoded ABI event topics.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const topics = decodeEventLog({
  abi: wagmiAbi, // [!code focus]
  data: '0x0000000000000000000000000000000000000000000000000000000000000001',
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```

### topics

- **Type:** `[Hex, ...(Hex | Hex[] | null)[]]`

A set of topics (encoded indexed args) from the [Event Log](/docs/glossary/terms#event-log).

```ts
const topics = decodeEventLog({
  abi: wagmiAbi,
  data: '0x0000000000000000000000000000000000000000000000000000000000000001',
  topics: [ // [!code focus:5]
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```

### data (optional)

- **Type:** `string`

The data (encoded non-indexed args) from the [Event Log](/docs/glossary/terms#event-log).

```ts
const topics = decodeEventLog({
  abi: wagmiAbi,
  data: '0x0000000000000000000000000000000000000000000000000000000000000001', // [!code focus]
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```

### eventName (optional)

- **Type:** `string`

An event name from the ABI. Provide an `eventName` to infer the return type of `decodeEventLog`.

```ts
const topics = decodeEventLog({
  abi: wagmiAbi,
  eventName: 'Transfer', // [!code focus]
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```

### strict (optional)

- **Type:** `boolean`
- **Default:** `true`

If `true`, `decodeEventLog` will throw an error if the `data` & `topics` lengths to not conform to the event on the ABI. 
If `false`, `decodeEventLog` will try and [partially decode](#partial-decode).

```ts
const topics = decodeEventLog({
  abi: wagmiAbi,
  strict: false, // [!code focus]
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```
