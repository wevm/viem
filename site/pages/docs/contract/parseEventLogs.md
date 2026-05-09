---
description: 'Extracts & decodes logs from a set of opaque logs.'
---

# parseEventLogs

Extracts & decodes logs matching the provided `abi` (and optional `eventName`) from a set of opaque logs.

Useful for decoding logs on Transaction Receipts.

## Install

```ts
import { parseEventLogs } from 'viem'
```

## Usage

:::code-group

```ts [example.ts]
import { parseEventLogs } from 'viem'
import { erc20Abi } from './abi'
import { client } from './client'

const receipt = await getTransactionReceipt(client, {
  hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
})

const logs = parseEventLogs({ 
  abi: erc20Abi, 
  logs: receipt.logs,
})
// [
//   { args: { ... }, eventName: 'Transfer', logIndex: 3 ... },  
//   { args: { ... }, eventName: 'Approval', logIndex: 5 ... },
//   ...
// ]
```

```ts [abi.ts]
export const erc20Abi = [
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
  {
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  }
  ...
] as const;
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Scoping to Event Name(s)

You can scope the logs to a specific event name by providing the `eventName` argument:

:::code-group

```ts [example.ts]
import { parseEventLogs } from 'viem'
import { erc20Abi } from './abi'
import { client } from './client'

const receipt = await getTransactionReceipt(client, {
  hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
})

const logs = parseEventLogs({ 
  abi: erc20Abi, 
  eventName: 'Transfer', // [!code hl]
  logs: receipt.logs,
})
// [
//   { args: { ... }, eventName: 'Transfer', logIndex: 3, ... },  
//   { args: { ... }, eventName: 'Transfer', logIndex: 7, ... },
//   ...
// ]
```

```ts [abi.ts]
export const erc20Abi = [
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
  {
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  }
  ...
] as const;
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

You can also pass an array to scope multiple event names:

:::code-group

```ts [example.ts]
import { parseEventLogs } from 'viem'
import { erc20Abi } from './abi'
import { client } from './client'

const receipt = await getTransactionReceipt(client, {
  hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
})

const logs = parseEventLogs({ 
  abi: erc20Abi, 
  eventName: ['Transfer', 'Approval'], // [!code hl]
  logs: receipt.logs,
})
// [
//   { args: { ... }, eventName: 'Transfer', logIndex: 3, ... },  
//   { args: { ... }, eventName: 'Approval', logIndex: 5, ... },  
//   { args: { ... }, eventName: 'Transfer', logIndex: 7, ... },
//   ...
// ]
```

```ts [abi.ts]
export const erc20Abi = [
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
  {
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  }
  ...
] as const;
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Scoping to Arguments

You can scope the logs to arguments by providing the `args` argument:

:::code-group

```ts [example.ts]
import { parseEventLogs } from 'viem'
import { erc20Abi } from './abi'
import { client } from './client'

const receipt = await getTransactionReceipt(client, {
  hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
})

const logs = parseEventLogs({ 
  abi: erc20Abi, 
  args: { // [!code focus]
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  }, // [!code focus]
  logs: receipt.logs,
})
// [
//   { args: { from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', ... }, eventName: '...', logIndex: 3, ... },  
//   { args: { from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', ... }, eventName: '...', logIndex: 7, ... },
//   ...
// ]
```

```ts [abi.ts]
export const erc20Abi = [
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
  {
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  }
  ...
] as const;
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

You can also pass an array to scope multiple values of an argument:

:::code-group

```ts [example.ts]
import { parseEventLogs } from 'viem'
import { erc20Abi } from './abi'
import { client } from './client'

const receipt = await getTransactionReceipt(client, {
  hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
})

const logs = parseEventLogs({ 
  abi: erc20Abi, 
  args: { // [!code focus]
    from: [ // [!code focus]
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // [!code focus]
    ], // [!code focus]
  }, // [!code focus]
  logs: receipt.logs,
})
// [
//   { args: { from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', ... }, eventName: '...', logIndex: 3, ... },  
//   { args: { from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', ... }, eventName: '...', logIndex: 7, ... },
//   ...
// ]
```

```ts [abi.ts]
export const erc20Abi = [
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
  {
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  }
  ...
] as const;
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Partial Decode

By default, if the `topics` and `data` does not conform to the ABI (a mismatch between the number of indexed/non-indexed arguments), `parseEventLogs` will not return return the decoded log.

For example, the following will not return the nonconforming log as there is a mismatch in non-`indexed` arguments & `data` length.

```ts
parseEventLogs({
  abi: parseAbi(['event Transfer(address indexed, address, uint256)']),
  logs: [{
    // `data` should be 64 bytes, but is only 32 bytes. // [!code hl]
    data: '0x0000000000000000000000000000000000000000000000000000000000000001', // [!code hl]
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ]
    // ...
  }]
})
// []
```

It is possible for `parseEventLogs` to try and partially decode the Log, this can be done by setting the `strict` argument to `false`:

```ts
parseEventLogs({
  abi: parseAbi(['event Transfer(address indexed, address, uint256)']),
  logs: [{
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ]
    // ...
  }]
  strict: false // [!code ++]
})
/**
 * [
 *  {
 *    eventName: 'Transfer',
 *    args: ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'],
 *    blockNumber: 42069420n,
 *    logIndex: 69,
 *    ...
 *  }
 * ]
 */
```

## Return Value

`Log[]`

Decoded logs.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const topics = parseEventLogs({
  abi: wagmiAbi, // [!code focus]
  logs: [{
    blockNumber: 69420n,
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    logIndex: 1,
    topics: [
      '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
      '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
      '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
    ]
    // ...
  }]
})
```

### logs

- **Type:** `Log[]`

An array of logs to parse.

```ts
const topics = parseEventLogs({
  abi: wagmiAbi,
  logs: [{ // [!code focus]
    blockNumber: 69420n, // [!code focus]
    data: '0x0000000000000000000000000000000000000000000000000000000000000001', // [!code focus]
    logIndex: 1, // [!code focus]
    topics: [ // [!code focus]
      '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0',  // [!code focus]
      '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
      '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8' // [!code focus]
    ] // [!code focus]
    // ... // [!code focus]
  }] // [!code focus]
})
```

### args (optional)

- **Type:** `{ [property: string]: string | string[] | null }`

Arguments to scope the logs to.

```ts
const topics = parseEventLogs({
  abi: wagmiAbi,
  args: { // [!code focus]
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  }, // [!code focus]
  logs: [{
    blockNumber: 69420n,
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    logIndex: 1,
    topics: [
      '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
      '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
      '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
    ]
    // ...
  }]
})
```

### eventName (optional)

- **Type:** `string`

An event name from the ABI.

```ts
const topics = parseEventLogs({
  abi: wagmiAbi,
  eventName: 'Transfer', // [!code focus]
  logs: [{
    blockNumber: 69420n,
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    logIndex: 1,
    topics: [
      '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
      '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
      '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
    ]
    // ...
  }]
})
```

### strict (optional)

- **Type:** `boolean`
- **Default:** `true`

If `true`, `parseEventLogs` will not return [nonconforming logs](#partial-decode). 
If `false`, `parseEventLogs` will try and [partially decode](#partial-decode) nonconforming logs.

```ts
const topics = parseEventLogs({
  abi: wagmiAbi,
  eventName: 'Transfer',
  logs: [{
    blockNumber: 69420n,
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    logIndex: 1,
    topics: [
      '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0', 
      '0x00000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266', 
      '0x0000000000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8'
    ]
    // ...
  }],
  strict: false // [!code focus]
})
```
