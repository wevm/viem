---
description: Returns the protocol version.
---

# getProtocolVersion

Returns the protocol version.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const version = await client.getProtocolVersion();
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSync,
  transport: http(),
}).extend(publicActionsL2())
```

:::

## Returns

`GetProtocolVersionReturnType`

Protocol version data.