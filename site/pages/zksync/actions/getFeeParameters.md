---
description: Returns the current fee parameters.
---

# getFeeParams

Returns the current fee parameters.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const version = await client.getFeeParams();
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

`GetFeeParamsReturnType`

Returns the current fee parameters.