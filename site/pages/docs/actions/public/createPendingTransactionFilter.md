# createPendingTransactionFilter [An Action for creating a new pending transaction filter.]

Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](/docs/actions/public/getFilterChanges).

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const filter = await publicClient.createPendingTransactionFilter() // [!code focus:99]
// @log: Output: { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
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

[`Filter`](/docs/glossary/types#filter)

## JSON-RPC Methods

[`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)