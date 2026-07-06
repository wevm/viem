---
description: Returns whether the withdrawal transaction is finalized on the L1 network.
---

# isWithdrawalFinalized

Returns whether the withdrawal transaction is finalized on the L1 network.

## Usage

:::code-group

```ts [example.ts]
import { client, zksyncClient } from './config'

const hash = await client.isWithdrawalFinalized({
  client: zksyncClient,
  hash: '0x…',
})
```

```ts [config.ts]
import { createPublicClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync, mainnet } from 'viem/chains'
import { publicActionsL2, publicActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

export const client = createPublicClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(publicActionsL1())
```

:::


## Returns

`boolean`

Whether the withdrawal transaction is finalized on the L1 network.

## Parameters

### client

- **Type:** `Client`

The L2 client for fetching data from L2 chain.

```ts
const hash = await client.isWithdrawalFinalized({
  client: zksyncClient, // [!code focus]
  hash: '0x…',
})
```

### hash 

- **Type:** `Hex`

Hash of the L2 transaction where the withdrawal was initiated.

```ts
const hash = await client.isWithdrawalFinalized({
  client: zksyncClient,
  hash: '0x…',  // [!code focus]
})
```

### index (optional)

- **Type:** `number`
- **Default:** `0`

In case there were multiple withdrawals in one transaction, you may pass an index of the
withdrawal you want to finalize.

```ts
const hash = await client.isWithdrawalFinalized({
  client: zksyncClient,
  hash: '0x…',
  index: 0n, // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `client.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await client.isWithdrawalFinalized({
  chain: zksync, // [!code focus]
  client: zksyncClient,
  hash: '0x…',
})
```