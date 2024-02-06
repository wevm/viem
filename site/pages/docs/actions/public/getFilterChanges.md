---
description: Returns a list of logs or hashes based on a Filter.
---

# getFilterChanges

Returns a list of logs or hashes based on a [Filter](/docs/glossary/terms#filter) since the last time it was called.

A Filter can be created from the following actions:

- [`createBlockFilter`](/docs/actions/public/createBlockFilter)
- [`createContractEventFilter`](/docs/contract/createContractEventFilter)
- [`createEventFilter`](/docs/actions/public/createEventFilter)
- [`createPendingTransactionFilter`](/docs/actions/public/createPendingTransactionFilter)

## Usage

### Blocks

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createBlockFilter() // [!code focus:99]
const hashes = await publicClient.getFilterChanges({ filter })
// @log: Output: ["0x10d86dc08ac2f18f00ef0daf7998dcc8673cbcf1f1501eeb2fac1afd2f851128", ...]
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

### Contract Events

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createContractEventFilter({ // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  abi: wagmiAbi,
  eventName: 'Transfer'
})
const logs = await publicClient.getFilterChanges({ filter })
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

### Raw Events

:::code-group

```ts twoslash [example.ts]
import { parseAbiItem } from 'viem'
import { publicClient } from './client'

const filter = await publicClient.createEventFilter({ // [!code focus:99]
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
})
const logs = await publicClient.getFilterChanges({ filter })
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

### Transactions

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createPendingTransactionFilter() // [!code focus:99]
const hashes = await publicClient.getFilterChanges({ filter })
// @log: Output: ["0x89b3aa1c01ca4da5d15eca9fab459d062db5c0c9b76609acb0741901f01f6d19", ...]
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

If the filter was created with `createContractEventFilter` or `createEventFilter`, it returns a list of logs.

**OR**

`"0x${string}"[]`

If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.

**OR**

`"0x${string}"[]`

If the filter was created with `createBlockFilter`, it returns a list of block hashes.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/types#filter)

A created filter.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createPendingTransactionFilter()
const logs = await publicClient.getFilterChanges({
  filter, // [!code focus]
})
```

## JSON-RPC Method

- Calls [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges).