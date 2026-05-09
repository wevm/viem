---
description: Returns the Chain Id of underlying L1 network.
---

# getL1ChainId

Returns the Chain Id of underlying L1 network.

:::warning
**This Action is being deprecated.**

This method calls an RPC method that [will be removed in a future release](https://github.com/zkSync-Community-Hub/zksync-developers/discussions/1066). Please use the alternatives mentioned below.

**Alternatives / Workaround**

The returned value can be retrieve via an onchain call to the `L1_CHAIN_ID()` method on the `L2AssetRouter` contract (deployed on `0x0000000000000000000000000000000000010003` address)
:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const chainId = await client.getL1ChainId();
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

`Hex`

L1 Chain ID.
