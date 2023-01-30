# encodeEventTopics

TODO

## Install

```ts
import { encodeEventTopics } from 'viem'
```

## Usage

Below is a very basic example of how to encode event topics without arguments.

::: code-group

```ts [example.ts]
import { encodeEventTopics } from 'viem'

const topics = encodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer'
})
// ["0xddf252ad"]
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

### Passing Arguments

If your event has indexed parameters, you can pass their values through with the `args` attribute.

TypeScript types for `args` will be inferred from the event name & ABI, to guard you from inserting the wrong values.

For example, the `Transfer` event below accepts an **address** argument for the `from` and `to` attributes, and it is typed as `"0x${string}"`.

::: code-group

```ts [example.ts]
import { encodeEventTopics } from 'viem'

const topics = encodeEventTopics({
  abi: wagmiAbi,
  eventName: 'Transfer'
  args: [{
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
  }]
})
// ["0xddf252ad", "0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266", "0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"]
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