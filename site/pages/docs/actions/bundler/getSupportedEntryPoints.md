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
import { createBundlerClient, http } from 'viem'

export const bundlerClient = createBundlerClient({
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

:::

## Returns

`readonly Address[]`

The EntryPoints that the bundler supports.
