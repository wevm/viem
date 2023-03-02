---
head:
  - - meta
    - property: og:title
      content: getFilterLogs
  - - meta
    - name: description
      content: Returns a list of event logs since the filter was created. 
  - - meta
    - property: og:description
      content: Returns a list of event logs since the filter was created. 

---

# getFilterLogs

Returns a list of **event** logs since the filter was created. 

Note: `getFilterLogs` is only compatible with **event filters**.

## Usage

```ts
import { parseAbiEvent } from 'viem'
import { publicClient } from '.'

const filter = await publicClient.createEventFilter({ // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiEvent('Transfer(address indexed, address indexed, uint256)'),
})
// ...
const logs = await publicClient.getFilterLogs({ filter })
// [{ ... }, { ... }, { ... }]
```

## Returns

[`Log[]`](/docs/glossary/types#log)

A list of event logs.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/types#filter)

An **event** filter.

```ts
const filter = await publicClient.createEventFilter()
const logs = await publicClient.getFilterChanges({
  filter, // [!code focus]
})
```