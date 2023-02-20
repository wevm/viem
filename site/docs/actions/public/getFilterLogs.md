# getFilterLogs

Returns a list of **event** logs since the filter was created. 

Note: `getFilterLogs` is only compatible with **event filters**.

## Import

```ts
import { getFilterLogs } from 'viem/public'
```

## Usage

```ts
import { createEventFilter, getFilterLogs } from 'viem/public'
import { parseAbiEvent } from 'viem/utils'
import { publicClient } from '.'

const filter = await createEventFilter(publicClient, { // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed, address indexed, uint256)'),
})
// ...
const logs = await getFilterLogs(publicClient, { filter })
// [{ ... }, { ... }, { ... }]
```

## Returns

[`Log[]`](/docs/glossary/types#TODO)

A list of event logs.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/types#TODO)

An **event** filter.

```ts
const filter = await createEventFilter(publicClient)
const logs = await getFilterLogs(publicClient, {
  filter, // [!code focus]
})
```