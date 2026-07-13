# createEventFilter [An Action for creating a new Event Filter.]

Creates a Filter to listen for new events that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges).

## Usage

By default, an Event Filter with no arguments will query for/listen to all events.

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createEventFilter()
// @log: { id: "0x345a6572337856574a76364e457a4366", type: 'event' }
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

:::tip
Check out [`createContractEventFilter`](/docs/contract/createContractEventFilter) if you are after a first-class solution for querying events on a contract without needing to manually craft ABI event parameters.
:::

## Scoping

You can also scope a Filter to a set of given attributes (listed below).

### Address

A Filter can be scoped to an **address**:

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createEventFilter({
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

A Filter can be scoped to an **event**.

The `event` argument takes in an event in ABI format – we have a [`parseAbiItem` utility](/docs/abi/parseAbiItem) that you can use to convert from a human-readable event signature → ABI.

:::code-group

```ts twoslash [example.ts]
import { parseAbiItem } from 'viem' // [!code focus]
import { publicClient } from './client'

const filter = await publicClient.createEventFilter({
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

By default, `event` accepts the [`AbiEvent`](/docs/glossary/types#abievent) type:

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createEventFilter(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: { // [!code focus:99]
    name: 'Transfer', 
    inputs: [
      { type: 'address', indexed: true, name: 'from' },
      { type: 'address', indexed: true, name: 'to' },
      { type: 'uint256', indexed: false, name: 'value' }
    ] 
  }
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

A Filter can be scoped to given **_indexed_ arguments**:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

Only indexed arguments in `event` are candidates for `args`.

A Filter Argument can also be an array to indicate that other values can exist in the position:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const filter = await publicClient.createEventFilter({
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

A Filter can be scoped to a **block range**:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

### Multiple Events

A Filter can be scoped to **multiple events**:

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbi } from 'viem'

const filter = await publicClient.createEventFilter({
  events: parseAbi([ // [!code focus:4]
    'event Approval(address indexed owner, address indexed sender, uint256 value)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ]),
})
```

Note: A Filter scoped to multiple events cannot be also scoped with [indexed arguments](#arguments) (`args`).

### Strict Mode

By default, `createEventFilter` will include logs that [do not conform](/docs/glossary/terms#non-conforming-log) to the indexed & non-indexed arguments on the `event`.
viem will not return a value for arguments that do not conform to the ABI, thus, some arguments on `args` may be undefined.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
})
const logs = await publicClient.getFilterLogs({ filter })

logs[0].args
//      ^?






```

You can turn on `strict` mode to only return logs that conform to the indexed & non-indexed arguments on the `event`, meaning that `args` will always be defined. The trade-off is that non-conforming logs will be filtered out.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  strict: true
})
const logs = await publicClient.getFilterLogs({ filter })

logs[0].args
//      ^?






```

## Returns

[`Filter`](/docs/glossary/types#filter)

## Parameters

### address (optional)

- **Type:** `Address | Address[]`

The contract address or a list of addresses from which Logs should originate.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createEventFilter({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### event (optional)

- **Type:** [`AbiEvent`](/docs/glossary/types#abievent)

The event in ABI format.

A [`parseAbiItem` utility](/docs/abi/parseAbiItem) is exported from viem that converts from a human-readable event signature → ABI.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem' // [!code focus]

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

### args (optional)

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
import { parseAbiItem } from 'viem'

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

### fromBlock (optional)

- **Type:** `bigint`

Block to start querying/listening from.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createEventFilter({
  fromBlock: 69420n // [!code focus]
})
```

### toBlock (optional)

- **Type:** `bigint`

Block to query/listen until.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createEventFilter({
  toBlock: 70120n // [!code focus]
})
```

## JSON-RPC Methods

[`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter)
