---
description: Returns a summary of all the transactions currently pending for inclusion in the next block(s).
---

# inspectTxpool

Returns a summary of all the transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

const data = await testClient.inspectTxpool() // [!code focus]
```

```ts [client.ts]
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

export const testClient = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
```

:::

## Returns

Transaction pool inspection data. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
