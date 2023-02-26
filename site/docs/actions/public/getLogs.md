---
head:
  - - meta
    - property: og:title
      content: getLogs
  - - meta
    - name: description
      content: Returns a list of event logs matching the provided parameters. 
  - - meta
    - property: og:description
      content: Returns a list of event logs matching the provided parameters. 

---

# getLogs

Returns a list of **event** logs matching the provided parameters. 

## Usage

By default, `getLogs` returns all events. In practice, you must use scoping to filter for specific events.

```ts
import { publicClient } from '.'

const logs = await publicClient.getLogs()  // [!code focus:99]
// [{ ... }, { ... }, { ... }]
```

## Scoping

You can also scope to a set of given attributes.

```ts
import { parseAbiEvent } from 'viem'
import { publicClient } from '.'

const logs = await publicClient.getLogs({  // [!code focus:99]
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  event: parseAbiEvent('Transfer(address indexed, address indexed, uint256)'),
  args: {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

By default, `event` accepts the [`AbiEvent`] type:

```ts
import { createEventFilter } from 'viem/public'
import { parseAbiEvent } from 'viem/utils' // [!code focus]
import { publicClient } from '.'

const filter = await getLogs(publicClient, {
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

### Address

A Filter can be scoped to an **address**:

```ts
const filter = await publicClient.getLogs({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### Event

A Filter can be scoped to an **event**.

The `event` argument takes in an event in ABI format – we have a [`parseAbiEvent` utility](/docs/contract/parseAbiEvent) that you can use to convert from a human-readable event signature → ABI.

```ts
import { parseAbiEvent } from 'viem' // [!code focus]
import { publicClient } from '.'

const filter = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

### Arguments

A Filter can be scoped to given **_indexed_ arguments**:

```ts
const filter = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

Only indexed arguments in `event` are candidates for `args`.

A Filter Argument can also be an array to indicate that other values can exist in the position:

```ts
const filter = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
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

```ts
const filter = await publicClient.getLogs({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

## Returns

[`Log[]`](/docs/glossary/types#TODO)

A list of event logs.

## Parameters

### address

- **Type:** [`Address | Address[]`](/docs/glossary/types#TODO)

A contract address or a list of contract addresses. Only logs originating from the contract(s) will be included in the result.

```ts
const logs = await publicClient.getLogs({
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
})
```

### event

- **Type:** [`AbiEvent`](/docs/glossary/types#TODO)

The event in ABI format.

A [`parseAbiEvent` utility](/docs/contract/parseAbiEvent) is exported from viem that converts from a human-readable event signature → ABI.

```ts
const logs = await publicClient.getLogs({
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

### args

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts
const logs = await publicClient.getLogs({
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  },
})
```

### fromBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to start including logs from. Mutually exclusive with `blockHash`.

```ts
const filter = await publicClient.createEventFilter({
  fromBlock: 69420n // [!code focus]
})
```

### toBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to stop including logs from. Mutually exclusive with `blockHash`.

```ts
const filter = await publicClient.createEventFilter({
  toBlock: 70120n // [!code focus]
})
```

### blockHash

- **Type:** `'0x${string}'`

Block hash to include logs from. Mutually exclusive with `fromBlock`/`toBlock`.

```ts
const logs = await publicClient.getLogs({
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

## Live Example

Check out the usage of `getLogs` in the live [Event Logs Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/filters-and-logs/event-logs?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0"></iframe>