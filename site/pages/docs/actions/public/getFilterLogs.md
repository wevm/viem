---
description: Returns a list of event logs since the filter was created. 
---

# getFilterLogs

Returns a list of **event** logs since the filter was created. 

Note: `getFilterLogs` is only compatible with **event filters**.

## Usage

:::code-group

```ts twoslash [example.ts]
import { parseAbiItem } from 'viem'
import { publicClient } from './client'

const filter = await publicClient.createEventFilter({ // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
})
const logs = await publicClient.getFilterLogs({ filter })
// @log: [{ ... }, { ... }, { ... }]
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


## Returns

[`Log[]`](/docs/glossary/types#log)

A list of event logs.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/types#filter)

An **event** filter.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createEventFilter()
const logs = await publicClient.getFilterChanges({
  filter, // [!code focus]
})
```

## JSON-RPC Method

[`eth_getFilterLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterlogs)