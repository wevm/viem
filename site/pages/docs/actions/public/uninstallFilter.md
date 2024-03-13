---
description: Destroys a Filter.
---

# uninstallFilter

Destroys a [`Filter`](/docs/glossary/types#filter) that was created from one of the following Actions:

- [`createBlockFilter`](/docs/actions/public/createBlockFilter)
- [`createEventFilter`](/docs/actions/public/createEventFilter)
- [`createPendingTransactionFilter`](/docs/actions/public/createPendingTransactionFilter)

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createPendingTransactionFilter()
const uninstalled = await publicClient.uninstallFilter({ filter }) // [!code focus:99]
// true
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

`boolean`

A boolean indicating if the Filter was successfully uninstalled.

## Parameters

### filter

- **Type:** [`Filter`](/docs/glossary/terms#filter)

A created filter.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const filter = await publicClient.createPendingTransactionFilter()
const uninstalled = await publicClient.uninstallFilter({
  filter, // [!code focus]
})
```

## JSON-RPC Method

[`eth_uninstallFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_uninstallFilter)