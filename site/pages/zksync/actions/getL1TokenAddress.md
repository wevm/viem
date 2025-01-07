---
description: Returns the L1 token address equivalent for a L2 token address as they are not equal.
---

# getL1TokenAddress

Returns the L1 token address equivalent for a L2 token address as they are not equal.

:::info

Only works for tokens bridged on default ZKsync Era bridges.

:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getL1TokenAddress({
  token: '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b'
})
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

Returns the L1 token address equivalent for a L2 token address.

## Parameters

### token

- **Type:** `Address`

The address of the token on L2.

```ts
const address = await client.getL1TokenAddress({
    token: '0x3e7676937A7E96CFB7616f255b9AD9FF47363D4b'
})
```
