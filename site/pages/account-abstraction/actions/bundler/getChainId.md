---
description: Returns the chain ID associated with the bundler
---

# getChainId

Returns the chain ID associated with the bundler

## Usage

:::code-group

```ts twoslash [example.ts]
import { bundlerClient } from './client'

const chainId = await bundlerClient.getChainId() // [!code focus:99]
// @log: 1
```

```ts twoslash [client.ts] filename="client.ts"
import { http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'

export const bundlerClient = createBundlerClient({
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

:::

:::info
The Bundler URL above is a public endpoint. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Bundler](https://www.pimlico.io), [Biconomy's Bundler](https://www.biconomy.io), or another Bundler service.
:::

## Returns

`number`

The current chain ID.
