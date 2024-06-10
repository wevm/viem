---
outline: deep
description: Returns a L2 transaction response from L1 transaction response.
---

# getL2TransactionFromPriorityOp

Returns a L2 transaction response from L1 transaction response.

## Usage

:::code-group

```ts [example.ts]
import { deposit } from './buildDepositTransaction.js'
import { clientL1, clientL2, account } from './config.ts'

const l1TransactionReceipt = await getTransactionReceipt(clientL1, { hash:"0x..." })

await getL2TransactionFromPriorityOp(clientL2, { 
  l1TransactionReceipt,
}),
```

```ts [config.ts]
import { createClient, createWalletClient, http } from 'viem'
import { zkSyncLocalHyperchainL1, zkSyncLocalHyperchain } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const account = privateKeyToAccount('0x...')

export const clientL1 = createClient({
  chain: zkSyncLocalHyperchainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

export const clientL2 = createClient({
  chain: zkSyncLocalHyperchain,
  transport: http(),
  account,
}).extend(publicActionsL2())
```

:::

## Returns

`GetTransactionReturnType`

It includes all properties about a transaction that was sent to the network, which may or may not be included in a block.

## Parameters

- **Type:** `GetL2TransactionFromPriorityOpParameters`

Object which requires l1TransactionReceipt.

```ts [example.ts]
import { deposit } from './buildDepositTransaction.js'
import { clientL1, clientL2, account } from './config.ts'

const l1TransactionReceipt = await getTransactionReceipt(clientL1, { hash:"0x..." })

await getL2TransactionFromPriorityOp(clientL2, { 
  l1TransactionReceipt, //[!code focus]
}),
```