---
description: Returns the hash of the L2 priority operation from a given L1 transaction receipt.
---

# getL2HashFromPriorityOp

Returns the hash of the L2 priority operation from a given L1 transaction receipt.

## Import

```ts
import { getL2HashFromPriorityOp } from 'viem/zksync'
```

## Usage

:::code-group

```ts [example.ts]
import { client, zksyncClient } from './config'
import { getL2HashFromPriorityOp } from 'viem/zksync'

const receipt = await client.waitForTransactionReceipt({
  hash: '0x...'
})
const l2Hash = getL2HashFromPriorityOp(
  receipt,
  await zksyncClient.getMainContractAddress()
)
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { zksync, mainnet } from 'viem/chains'
import { publicActionsL2 } from 'viem/zksync'

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: http(),
}).extend(publicActionsL2())
```

:::


## Returns

`Hash`

The hash of the L2 priority operation.

## Parameters

### receipt

- **Type:** [`TransactionReceipt`](/docs/glossary/types#transactionreceipt)

The L1 transaction receipt.

```ts
const l2Hash = getL2HashFromPriorityOp(
  receipt, // [!code focus]
  '0x14b947814912c71bdbc3275c143a065d2ecafaba'
)
```

### zksync

- **Type:** `Address`

The address of the ZKsync Era main contract.

```ts
const l2Hash = getL2HashFromPriorityOp(
  receipt, 
  '0x14b947814912c71bdbc3275c143a065d2ecafaba' // [!code focus]
)
```