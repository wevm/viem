---
description: Returns the address of a Main ZKsync Contract.
---

# getMainContractAddress (deprecated)

Returns the address of a main ZKsync Chain Contract.

:::warning
**This Action is being deprecated.**

This method calls an RPC method that will be removed in a future release. Please use the alternatives mentioned below.

**Alternatives / Workaround**

This method returned the address of the chain contract in L1. This can be retrieved from a call to the BridgeHub contract.

1. Retrieve the BridgeHub contract address using the `getBridgeHubContract` action.
2. Call the `getZKChain(chainId)` method on the BridgeHub contract.

:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getMainContractAddress();
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

Main ZKsync Era smart contract address.
