---
description: Returns the L2 token address equivalent for a L1 token address as they are not equal.
---

# getL2TokenAddress

Returns the L2 token address equivalent for a L1 token address as they are not equal.

:::info
Only works for tokens bridged on default ZKsync Era bridges.
:::

## Usage

:::code-group

```ts [example.ts]
import { client } from './config'

const address = await client.getL2TokenAddress({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B'
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

Returns the L2 token address equivalent for a L1 token address.

## Parameters

### token

- **Type:** `Address`

The address of the token on L1.

```ts
const address = await client.getL2TokenAddress({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B'
})
```

### bridgeAddress (optional)

- **Type:** `Address`

The address of custom bridge, which will be used to get l2 token address.

```ts
const address = await client.getL2TokenAddress({
    token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    bridgeAddress: '0xf8c919286126ccf2e8abc362a15158a461429c82' // [!code focus]
})
```

