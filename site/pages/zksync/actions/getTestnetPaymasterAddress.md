---
description: Returns the address of a Paymaster on a Testnet.
---

# getTestnetPaymasterAddress (depreated)

Returns the address of the testnet Paymaster.

:::warning
**This Action is being deprecated.**

This method calls an RPC method that [will be removed in a future release](https://github.com/zkSync-Community-Hub/zksync-developers/discussions/1066). Please use the alternatives mentioned below.

**Alternatives / Workaround**

The returned value can be found on each ZKsync chain technical documentation (e.g [ZKsync Era docs](https://docs.zksync.io/zksync-era/unique-features/paymaster#testnet-paymaster)).
:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'
const address = await client.getTestnetPaymasterAddress();
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

`Address | null`

Testnet paymaster address if available, or `null`.
