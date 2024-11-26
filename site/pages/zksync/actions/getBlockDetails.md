---
description: Returns additional ZKsync-specific information about the L2 block.
---

# getBlockDetails

Returns additional ZKsync-specific information about the L2 block.

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const blockDetails = await client.getBlockDetails({
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

`BaseBlockDetails`

Structure that represent ZKsync-specific information about L2 block.

## Parameters

### number

Block Number

- **Type** `number`

```ts
const blockDetails = await client.getBlockDetails({
  number: 1 // [!code focus]
}); 
```