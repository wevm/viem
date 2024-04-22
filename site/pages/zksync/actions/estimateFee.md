---
description: Returns an estimated Fee for requested transaction.
---

# estimateFee

Returns an estimated Fee for requested transaction.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const fee = await client.estimateFee({
  account: '0x636A122e48079f750d44d13E5b39804227E1467e',
  to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
  value: 0n
});
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zkSyncLocalNode } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: zkSyncLocalNode,
  transport: http(),
}).extend(publicActionsL2())
```
:::

## Returns 

`Fee`

## Parameters

`EstimateFeeParameters`

```ts
const fee = await client.estimateFee({
  account: "0x636A122e48079f750d44d13E5b39804227E1467e",
  to: "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
  value: 0n
})
```