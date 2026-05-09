---
description: Returns a list of event logs matching the provided parameters. 
---

# getLogs

Returns a list of **event** logs matching the provided parameters.

## Usage

By default, `getLogs` returns all events. In practice, you must use scoping to filter for specific events.

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const logs = await publicClient.getLogs()  // [!code focus:99]
// @log: Output: [{ ... }, { ... }, { ... }]
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Scoping

You can also scope to a set of given attributes.

:::code-group

```ts twoslash [example.ts]
import { parseAbiItem } from 'viem'
import { publicClient } from './client'

const logs = await publicClient.getLogs({  // [!code focus:99]
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256)'),
  args: {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

By default, `event` accepts the [`AbiEvent`](/docs/glossary/types#abievent) type:

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const logs = await publicClient.getLogs(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: { // [!code focus:8]
    name: 'Transfer', 
    inputs: [
      { type: 'address', indexed: true, name: 'from' },
      { type: 'address', indexed: true, name: 'to' },
      { type: 'uint256', indexed: false, name: 'value' }
    ] 
  },
  args: {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Address

Logs can be scoped to an **address**:

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const logs = await publicClient.getLogs({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Event

Logs can be scoped to an **event**.

The `event` argument takes in an event in ABI format – we have a [`parseAbiItem` utility](/docs/abi/parseAbiItem) that you can use to convert from a human-readable event signature → ABI.

:::code-group

```ts twoslash [example.ts]
import { parseAbiItem } from 'viem' // [!code focus]
import { publicClient } from './client'

const logs = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Arguments

Logs can be scoped to given **_indexed_ arguments**:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const logs = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

Only indexed arguments in `event` are candidates for `args`.

An argument can also be an array to indicate that other values can exist in the position:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const logs = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:8]
    // '0xd8da...' OR '0xa5cc...' OR '0xa152...'
    from: [
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
      '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
    ],
  }
})
```

### Block Range

Logs can be scoped to a **block range**:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const logs = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

### Multiple Events

Logs can be scoped to **multiple events**:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbi } from 'viem'

const logs = await publicClient.getLogs({
  events: parseAbi([ // [!code focus:4]
    'event Approval(address indexed owner, address indexed sender, uint256 value)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ]),
})
```

Note: Logs scoped to multiple events cannot be also scoped with [indexed arguments](#arguments) (`args`).

### Strict Mode

By default, `getLogs` will include logs that [do not conform](/docs/glossary/terms#non-conforming-log) to the indexed & non-indexed arguments on the `event`.
viem will not return a value for arguments that do not conform to the ABI, thus, some arguments on `args` may be undefined.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem' 

const logs = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)')
})

logs[0].args
//      ^? 






```

You can turn on `strict` mode to only return logs that conform to the indexed & non-indexed arguments on the `event`, meaning that `args` will always be defined. The trade-off is that non-conforming logs will be filtered out.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem' 

const logs = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  strict: true
})

logs[0].args
//      ^?






```

## Returns

[`Log[]`](/docs/glossary/types#log)

A list of event logs.

## Parameters

### address

- **Type:** [`Address | Address[]`](/docs/glossary/types#address)

A contract address or a list of contract addresses. Only logs originating from the contract(s) will be included in the result.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const logs = await publicClient.getLogs({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
})
```

### event

- **Type:** [`AbiEvent`](/docs/glossary/types#abievent)

The event in ABI format.

A [`parseAbiItem` utility](/docs/abi/parseAbiItem) is exported from viem that converts from a human-readable event signature → ABI.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const logs = await publicClient.getLogs({
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

### args

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const logs = await publicClient.getLogs({
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
})
```

### fromBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to start including logs from. Mutually exclusive with `blockHash`.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createEventFilter({
  fromBlock: 69420n // [!code focus]
})
```

### toBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to stop including logs from. Mutually exclusive with `blockHash`.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createEventFilter({
  toBlock: 70120n // [!code focus]
})
```

### blockHash

- **Type:** `'0x${string}'`

Block hash to include logs from. Mutually exclusive with `fromBlock`/`toBlock`.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const logs = await publicClient.getLogs({
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

## Live Example

Check out the usage of `getLogs` in the live [Event Logs Example](https://stackblitz.com/github/wevm/viem/tree/main/examples/logs_event-logs) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/logs_event-logs?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>

## JSON-RPC Method

[`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
