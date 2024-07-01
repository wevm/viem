---
description: Returns the cost of a l2 transaction.
---

# getL2TransactionBaseCost

:::code-group
```ts [example.ts]
import { client } from './config'
import { parameters } from './parameters'

  const baseCost = await client.getL2TransactionBaseCost(parameters);
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL1 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSyncLocalNodeL1,
  transport: http(),
}).extend(publicActionsL1())

```

```ts [parameters.ts]
export const parameters = {
  gasPriceForEstimation:1000000n,
  l2GasLimit: 100000n,
  gasPerPubdataByte: 800n,
  bridgehubContractAddress:"0x5C221E77624690fff6dd741493D735a17716c26B",
}   
```
:::


# Returns

`bigint`

Cost of a l2 trnasaction.

## Parameters

### params

- **Type:** `GetL2TransactionBaseCostParameters`

```ts
import { client } from './config'

  const address = await client.getL2BridgeAddress({
  gasPriceForEstimation:1000000n,
  l2GasLimit: 100000n,
  gasPerPubdataByte: 800n,
  bridgehubContractAddress:"0x5C221E77624690fff6dd741493D735a17716c26B",
})
```