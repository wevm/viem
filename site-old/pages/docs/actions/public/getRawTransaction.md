---
description: Returns the raw, serialized transaction given a hash.
---

# getRawTransaction

Returns the raw, serialized [Transaction](/docs/glossary/terms#transaction) given a hash.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const rawTransaction = await publicClient.getRawTransaction({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
// @log: '0x02f8d4018307d45c843b9aca0085070e98ce8383...'
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

[`Hex`](/docs/glossary/types#hex)

The raw, serialized transaction.

## Parameters

### hash

- **Type:** `'0x${string}'`

The transaction hash.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const rawTransaction = await publicClient.getRawTransaction({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```

## JSON-RPC Method

`eth_getRawTransactionByHash`
