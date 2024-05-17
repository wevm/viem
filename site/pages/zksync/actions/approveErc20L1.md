---
description: Approves spending a specified token amount
---

# approveErc20L1

## Usage

:::code-group
```ts [example.ts]
import { client } from './config'

  const hash = await client.approveErc20L1({
    amount: 100000n,
    token: '0x5C221E77624690fff6dd741493D735a17716c26B'
  })
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
:::

## Returns

`Hash`

Hash of the transaction.

## Parameters

### amount

- **Type:** `bigint`

The amount to be approved.

```ts
import { client } from './config'

  const hash = await client.approveErc20L1({
    amount: 100000n, //[!code focus]
    token: '0x5C221E77624690fff6dd741493D735a17716c26B'
  })
```

### token

- **Type:** `Address`

Address of a token.

```ts
import { client } from './config'

  const hash = await client.approveErc20L1({
    amount: 100000n, 
    token: '0x5C221E77624690fff6dd741493D735a17716c26B' //[!code focus]
  })
```