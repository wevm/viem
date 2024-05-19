---
description: Returns the address of a Paymaster on a Testnet.
---

# getTestnetPaymasterAddress

Returns the address of a Paymaster on a Testnet.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'
const address = await client.getTestnetPaymasterAddress();
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

`Address | null`

Testnet paymaster address if available, or `null`.