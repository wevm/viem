---
description: Returns the L1 transaction canonical hash.
---

# requestL2TransactionTwoBridges

## Usage

:::code-group
```ts [example.ts]
import { client } from './config'
import { parameters } from './parameters.ts'

const txRequest = await client.requestL2TransactionTwoBridges(parameters);
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
   bridgehubContractAddress:'0x8E5937cE49C72264a2318163Aa96F9F973A83192',
   mintValue: parseUnits('800', 18),
   l2Contract: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   l2Value: 1n,
   l2Calldata: '0x',
   l2GasLimit: 10000000n,
   l2GasPerPubdataByteLimit: 800n,
   factoryDeps: [],
   refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
}
```

:::


## Returns

`Hash`

The L1 Canonical Transaction Hash.

## Parameters

### parameters

- **Type:** `L2TransactionRequestDirectParameters`

Parameters for the requestL2TransactionDirect call.

```ts
import { client } from './config'
import { parameters } from './parameters.ts'

  const hash = await client.requestL2TransactionDirect({
    bridgehubContractAddress:'0x8E5937cE49C72264a2318163Aa96F9F973A83192',
    mintValue: parseUnits('800', 18),
    l2Contract: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
    l2Value: 1n,
    l2Calldata: '0x',
    l2GasLimit: 10000000n,
    l2GasPerPubdataByteLimit: 800n,
    factoryDeps: [],
    refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
  });
```