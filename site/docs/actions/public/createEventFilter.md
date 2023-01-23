# createEventFilter

Creates a Filter to listen for new events that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges).

## Install

```ts
import { createEventFilter } from 'viem'
```

## Usage

By default, an Event Filter with no arguments will query for/listen to all events.

```ts
import { createEventFilter } from 'viem'
import { publicClient } from '.'

const filter = await createEventFilter(publicClient)
// { id: "0x345a6572337856574a76364e457a4366", type: 'event' }
```

## Scoping

You can also scope a Filter to a set of given attributes (listed below).

### Address

A Filter can be scoped to an **address**:

```ts
const filter = await createEventFilter(publicClient, {
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2'
})
```

### Event

A Filter can be scoped to an **event**:

```ts
const filter = await createEventFilter(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
})
```

### Arguments

A Filter can be scoped to given **_indexed_ arguments**:

```ts
const filter = await createEventFilter(publicClient, {
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
const filter = await createEventFilter(publicClient, {
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
const filter = await createEventFilter(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
  fromBlock: 16330000n,
  toBlock: 16330050n
})
```

## Returns

[`Filter`](/docs/glossary/types#TODO)

## Parameters

### address

- **Type:** `Address | Address[]`

The contract address or a list of addresses from which Logs should originate.

```ts
const filter = await createEventFilter(publicClient, {
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### event

- **Type:** `string`

The event definition.

```ts
const filter = await createEventFilter(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)', // [!code focus]
})
```

### args

- **Type:** `EventFilterArgs`

A list of _indexed_ event arguments.

```ts
const filter = await createEventFilter(publicClient, {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: 'Transfer(address indexed from, address indexed to, uint256 value)',
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

### fromBlock

- **Type:** `bigint`

Block to start querying/listening from.

```ts
const filter = await createEventFilter(publicClient, {
  fromBlock: 69420n // [!code focus]
})
```

### toBlock

- **Type:** `bigint`

Block to query/listen until.

```ts
const filter = await createEventFilter(publicClient, {
  fromBlock: 70120n // [!code focus]
})
```

## Example