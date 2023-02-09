# decodeEventTopics

Decodes ABI encoded event topics into an event name and arguments.

## Install

```ts
import { decodeEventTopics } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { decodeEventTopics } from 'viem'

const topics = decodeEventTopics({
  abi: wagmiAbi,
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
 *    }
 *  }
 */
```

```ts
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

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

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

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
const topics = decodeEventTopics({
  abi: wagmiAbi, // [!code focus]
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```

### topics

- **Type:** `[Hex, ...(Hex | Hex[] | null)[]]`

A set of topics.

```ts
const topics = decodeEventTopics({
  abi: wagmiAbi,
  topics: [ // [!code focus:5]
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```

### eventName (optional)

- **Type:** `string`

An event name from the ABI. Provide an `eventName` to infer the return type of `decodeEventTopics`.

```ts
const topics = decodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer', // [!code focus:5]
  topics: [
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
    '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
    '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
  ]
})
```