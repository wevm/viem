---
description: Retrieves information about a User Operation given a hash.
---

# getUserOperation

Retrieves information about a User Operation given a hash.

## Usage

:::code-group

```ts twoslash [example.ts]
import { bundlerClient } from './client'

const result = await bundlerClient.getUserOperation({ // [!code focus:99]
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
})
```

```ts twoslash [client.ts] filename="client.ts"
import { http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'

export const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

:::

:::info
The Bundler URL above is a public endpoint. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Bundler](https://www.pimlico.io), [Biconomy's Bundler](https://www.biconomy.io), or another Bundler service.
:::

## Returns

```ts
{
  blockHash: Hash,
  blockNumber: bigint,
  entryPoint: Address,
  transactionHash: Hash,
  userOperation: UserOperation
}
```

User Operation information.

## Parameters

### hash

- **Type:** `'0x${string}'`

A User Operation hash.

```ts twoslash
import { bundlerClient } from './client'
// ---cut---
const result = await publicClient.getUserOperation({
  hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' // [!code focus]
})
```
