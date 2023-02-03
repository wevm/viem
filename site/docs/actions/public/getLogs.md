# getLogs

Returns a list of **event** logs matching the provided parameters. 

## Import

```ts
import { getLogs } from 'viem'
```

## Usage

By default, `getLogs` returns all events. In practice, you must use scoping to filter for specific events.

```ts
import { getLogs } from 'viem'
import { publicClient } from '.'

const logs = await getLogs(publicClient)  // [!code focus:99]
// [{ ... }, { ... }, { ... }]
```

## Scoping

You can also scope to a set of given attributes.

```ts
import { getLogs } from 'viem'
import { publicClient } from '.'

const logs = await getLogs(publicClient, {  // [!code focus:99]
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
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
const filter = await getLogs(publicClient, {
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2'
})
```

### Event

A Filter can be scoped to an **event**:

```ts
const filter = await getLogs(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
})
```

### Arguments

A Filter can be scoped to given **_indexed_ arguments**:

```ts
const filter = await getLogs(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
  args: {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

Only indexed arguments in `event` are candidates for `args`.

A Filter Argument can also be an array to indicate that other values can exist in the position:

```ts
const filter = await getLogs(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
  args: {
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
const filter = await getLogs(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
  fromBlock: 16330000n,
  toBlock: 16330050n
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
const logs = await getLogs(publicClient, {
  address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
})
```

### event

- **Type:** `string`

The event definition.

```ts
const logs = await getLogs(publicClient, {
  event: 'Transfer(address indexed from, address indexed to, uint256 value)', // [!code focus]
})
```

### args

- **Type:** `EventFilterArgs`

A list of _indexed_ event arguments.

```ts
const logs = await getLogs(publicClient, {
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
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
const filter = await createEventFilter(publicClient, {
  fromBlock: 69420n // [!code focus]
})
```

### toBlock

- **Type:** `bigint | 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`

Block to stop including logs from. Mutually exclusive with `blockHash`.

```ts
const filter = await createEventFilter(publicClient, {
  toBlock: 70120n // [!code focus]
})
```

### blockHash

- **Type:** `'0x${string}'`

Block hash to include logs from. Mutually exclusive with `fromBlock`/`toBlock`.

```ts
const logs = await getLogs(publicClient, {
  blockHash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```