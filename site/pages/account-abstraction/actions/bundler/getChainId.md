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
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

:::

## Returns

`number`

The current chain ID.
