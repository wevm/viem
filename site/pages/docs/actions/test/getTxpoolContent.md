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
// @log: {
// @log:   pending: {
// @log:     '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
// @log:       '0': { hash: '0x...', nonce: '0x0', ... },
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

`GetTxpoolContentReturnType`

Transaction pool content. [See here](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool).
