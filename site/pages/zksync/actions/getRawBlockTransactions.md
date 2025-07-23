---
description: Returns data of transactions in a block.
---

# getRawBlockTransaction (deprecated)

Returns data of transactions in a block.

:::warning
**This Action is being deprecated.**

This method calls an RPC method that [will be removed in a future release](https://github.com/zkSync-Community-Hub/zksync-developers/discussions/1066). Please use the alternatives mentioned below.

**Alternatives / Workaround**

The returned value can be retrieved using `debug_getRawTransaction` and `debug_getRawTransactions`.

:::


## Usage

:::code-group

```ts [example.ts]
import { client } from './config'


const rawTx = await client.getRawBlockTransaction({
  number: 1
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

`RawBlockTransactions`

Data of transactions in a block.

## Parameters

### number

Block number.

```ts
const rawTx = await client.getRawBlockTransaction({
  number: 1  // [!code focus]
});
```
