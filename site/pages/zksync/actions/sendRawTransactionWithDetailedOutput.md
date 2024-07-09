---
description: Returns transaction hash, storage logs, and events that would have been generated if the transaction had already been included in the block.
---

# sendRawTransactionWithDetailedOutput

Returns transaction hash, storage logs, and events that would have been generated if the transaction had already been included in the block.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const confirmedTokens = await client.sendRawTransactionWithDetailedOutput({
  signedTx:"0x..."
});
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

`SendRawTransactionWithDetailedReturnType`

Transaction hash, storage logs, and events that would have been generated if the transaction had already been included in the block.