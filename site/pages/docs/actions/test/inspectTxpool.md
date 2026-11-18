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
// @log: {
// @log:   pending: {
// @log:     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
// @log:       '0': '0x70997970C51812dc3A010C7d01b50e0d17dc79C8: 1000000000000000000 wei + 21000 gas × 1000000000 wei',
// @log:     },
// @log:   },
// @log:   queued: {},
// @log: }
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

## Return Value

`InspectTxpoolReturnType`

Transaction pool inspection data. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
