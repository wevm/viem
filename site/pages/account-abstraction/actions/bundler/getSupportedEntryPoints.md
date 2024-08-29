---
description: Returns the EntryPoints that the bundler supports.
---

# getSupportedEntryPoints

Returns the EntryPoints that the bundler supports.

## Usage

:::code-group

```ts twoslash [example.ts]
import { bundlerClient } from './client'

const entryPoints = await bundlerClient.getSupportedEntryPoints() // [!code focus:99]
// @log: ["0x0000000071727De22E5E9d8BAf0edAc6f37da032"]
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

`readonly Address[]`

The EntryPoints that the bundler supports.
