---
head:
  - - meta
    - property: og:title
      content: createPendingTransactionFilter
  - - meta
    - name: description
      content: An Action for creating a new pending transaction filter.
  - - meta
    - property: og:description
      content: An Action for creating a new pending transaction filter.

---

# createPendingTransactionFilter

Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges).

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createPendingTransactionFilter() // [!code focus:99]
// { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

[`Filter`](/docs/glossary/types#filter)

## JSON-RPC Methods

[`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)