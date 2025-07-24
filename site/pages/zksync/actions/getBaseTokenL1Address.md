---
description: Returns the base token L1 address.
---

# getBaseTokenL1Address (deprecated)

Returns the address of the ZKsync Chain's base L1 token.

:::warning
**This Action is being deprecated.**

This method calls an RPC method that [will be removed in a future release](https://github.com/zkSync-Community-Hub/zksync-developers/discussions/1066). Please use the alternatives mentioned below.

**Alternatives / Workaround**

This method returned the address of the chain's base token contract in L1. This can be retrieved from a call to the BridgeHub contract.

1. Retrieve the BridgeHub contract address using the `getBridgeHubContract` action.
2. Call the `baseToken(chainId)` method on the BridgeHub contract.

:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getBaseTokenL1Address();
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

`Address`

Base Token L1 address.
