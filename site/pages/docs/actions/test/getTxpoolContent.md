---
description: Returns the details of all transactions currently pending for inclusion in the next block(s).
---

# getTxpoolContent

Returns the details of all transactions currently pending for inclusion in the next block(s), as well as the ones that are being scheduled for future execution only. [Read more](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).

## Usage

:::code-group

```ts [example.ts]
import { testClient } from './client'

const content = await testClient.getTxpoolContent() // [!code focus]
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

Transaction pool content. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
