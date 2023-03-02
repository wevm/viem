---
head:
  - - meta
    - property: og:title
      content: createEventFilter
  - - meta
    - name: description
      content: An Action for creating a new Event Filter.
  - - meta
    - property: og:description
      content: An Action for creating a new Event Filter.

---

# createEventFilter

Creates a Filter to listen for new events that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges).

## Usage

By default, an Event Filter with no arguments will query for/listen to all events.

```ts
import { publicClient } from '.'

const filter = await publicClient.createEventFilter()
// { id: "0x345a6572337856574a76364e457a4366", type: 'event' }
```

## Scoping

You can also scope a Filter to a set of given attributes (listed below).

### Address

A Filter can be scoped to an **address**:

```ts 
import { publicClient } from '.'

const filter = await publicClient.createEventFilter({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### Event

A Filter can be scoped to an **event**.

The `event` argument takes in an event in ABI format – we have a [`parseAbiEvent` utility](/docs/contract/parseAbiEvent) that you can use to convert from a human-readable event signature → ABI.

```ts
import { parseAbiEvent } from 'viem' // [!code focus]
import { publicClient } from '.'

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

By default, `event` accepts the [`AbiEvent`] type:

```ts
import { createEventFilter } from 'viem/public'
import { parseAbiEvent } from 'viem/utils' // [!code focus]
import { publicClient } from '.'

const filter = await createEventFilter(publicClient, {
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

### Arguments

A Filter can be scoped to given **_indexed_ arguments**:

```ts
const filter = await publicClient.createEventFilter({
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
const filter = await publicClient.createEventFilter({
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
const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 16330000n, // [!code focus]
  toBlock: 16330050n // [!code focus]
})
```

## Returns

[`Filter`](/docs/glossary/types#filter)

## Parameters

### address (optional)

- **Type:** `Address | Address[]`

The contract address or a list of addresses from which Logs should originate.

```ts
const filter = await publicClient.createEventFilter({
  address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2' // [!code focus]
})
```

### event (optional)

- **Type:** [`AbiEvent`](/docs/glossary/types#abievent)

The event in ABI format.

A [`parseAbiEvent` utility](/docs/contract/parseAbiEvent) is exported from viem that converts from a human-readable event signature → ABI.

```ts
import { parseAbiEvent } from 'viem' // [!code focus]

const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'), // [!code focus]
})
```

### args (optional)

- **Type:** Inferred.

A list of _indexed_ event arguments.

```ts
const filter = await publicClient.createEventFilter({
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed from, address indexed to, uint256 value)'),
  args: { // [!code focus:4]
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
  }
})
```

### fromBlock (optional)

- **Type:** `bigint`

Block to start querying/listening from.

```ts
const filter = await publicClient.createEventFilter({
  fromBlock: 69420n // [!code focus]
})
```

### toBlock (optional)

- **Type:** `bigint`

Block to query/listen until.

```ts
const filter = await publicClient.createEventFilter({
  fromBlock: 70120n // [!code focus]
})
```

## JSON-RPC Methods

[`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newFilter)