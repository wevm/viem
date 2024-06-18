---
outline: deep
description: Proves the inclusion of the `L2->L1` withdrawal message.
---

# initiateWithdraw

Proves the inclusion of the `L2->L1` withdrawal message.

## Usage

:::code-group

```ts [example.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal } from 'viem/zksync'

// Finalizes the withdrawal
const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
  txHash: hash,
}) 
```

```ts [config.ts]
import { createClient, createWalletClient, http } from 'viem'
import { zkSyncChainL1, zkSyncChainL2 } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const account = privateKeyToAccount('0x...')

export const clientL1 = createClient({
  chain: zkSyncChainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

export const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
  account,
}).extend(publicActionsL2())

```

:::

## Returns

`FinalizeWithdrawalReturnType`

it incldues a Hash of the withdrawal finalization transaction.

## Parameters

- **Type:** `FinalizeWithdrawalParameters`

Object which contains necessary data for constructing withdraw transaction.

### txHash

- **Type:** `Hash`

Withdraw Transaction Hash.


```ts
const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
  txHash: "0x...", // [!code focus]
}) 
```