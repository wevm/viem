---
description: Returns data from a specific transaction given by the transaction hash.
---

# getTransactionDetails

Returns data from a specific transaction given by the transaction hash.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const details = await client.getTransactionDetails({
  txHash: '0x...'
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`TransactionDetails`

Data from a specific transaction given by the transaction hash.

## Parameters

`GetTransactionDetailsParameters`

### hash

Transaction hash

```ts
const details = await client.getTransactionDetails({
  txHash: '0x...' // [!code focus]
});
```
