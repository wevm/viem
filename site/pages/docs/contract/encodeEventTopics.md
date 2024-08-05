---
description: Encodes an event (with optional arguments) into filter topics.
---

# encodeEventTopics

Encodes an event (with optional arguments) into filter topics.

## Install

```ts
import { encodeEventTopics } from 'viem'
```

## Usage

Below is a very basic example of how to encode event topics without arguments.

:::code-group

```ts [example.ts]
import { encodeEventTopics } from 'viem'
import { wagmiAbi } from './abi.ts'

const topics = encodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer'
})
// ["0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0"]
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

### Passing Arguments

If your event has indexed parameters, you can pass their values through with the `args` attribute.

TypeScript types for `args` will be inferred from the event name & ABI, to guard you from inserting the wrong values.

For example, the `Transfer` event below accepts an **address** argument for the `from` and `to` attributes, and it is typed as `"0x${string}"`.

:::code-group

```ts [example.ts]
import { encodeEventTopics } from 'viem'

const topics = encodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer'
  args: {
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
  }
})
// ["0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0", "0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266", "0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"]
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

### Without `eventName`

If your `abi` contains only one ABI item, you can omit the `eventName` (it becomes optional):

```ts
import { encodeEventTopics } from 'viem'

const abiItem = {
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
}

const topics = encodeEventTopics({
  abi: [abiItem],
  eventName: 'Transfer' // [!code --]
})
// ["0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0"]
```

## Return Value

Encoded topics.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const data = encodeEventTopics({
  abi: wagmiAbi, // [!code focus]
  functionName: 'Transfer',
})
```

### eventName

- **Type:** `string`

Name of the event.

```ts
const data = encodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer', // [!code focus]
})
```

### args (optional)

- **Type:** `string`

A list of _indexed_ event arguments.

```ts
const data = encodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer',
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```