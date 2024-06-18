---
head:
  - - meta
    - property: og:title
      content: Withdraw
  - - meta
    - name: description
      content: How to withdraw from zkSync Era chains to Mainnet.
  - - meta
    - property: og:description
      content: How to withdraw from zkSync Era chains to Mainnet.

---

# Withdraw

This guide will demonstrate how to withdraw **1 Ether** from **[ZkSync Era](https://zksync.io/)** to **Mainnet**.

## Overview

Withdraw on the ZkSync Era is a two process which involves:

1. **Initiating** the Withdraw Transaction on the L2

2. **Finalizing** the Withdrawal Transaction on the L1.

Here is a complete end-to-end overview of how to execute a withdrawal, broken down into steps.


Full code:

:::code-group
```ts [withdraw.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal, finalizeWithdrawal } from 'viem/zksync'
import { sendTransaction, waitForTransactionReceipt, getTransactionReceipt } from 'viem/actions'

// Prepear parameters for initiating the withdrawal.
const withdrawTx: WithdrawTransaction = {
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
  from: account.address,
}
// Initiate the withdrawal transaction.
const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)


// Finalize the withdrawal.
const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
    txHash: hash,
})

// Wait for withdrawal transaction receipt.
await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash })

// Get withdrawal transaction receipt.
const finalizedTxReceipt = await getTransactionReceipt(clientL1, {
    hash: finalizeWithdrawalHash,
}),

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


## Steps

### 1. Set up Viem Clients

First, we will set up our Viem Clients for the Mainnet and zkSync chains, including the necessary extensions for the zkSync Stack.

We will place these in a `config.ts` file.

:::info

The example belows how to set up a Client for **Local Account (Private Key)**

:::


:::code-group

```ts [config.ts (Local Account)]
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

### 2. Prepear withdraw 

Prepearing the parameters for withdraw is one the crucial parts. 
In the example below, our we are withdawing **1 wei** from the Zksync Era network to the L1 (Mainnet)

```ts
// Prepear parameters for initiating the withdrawal.
const withdrawTx = {
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
  from: account.address,
}
```

### 3. Initiate the withdrawal transaction.

After setuping up the parameters, we will initiate the withdraw transaction.

After that we will receive transaction hash for the withdrawal.

:::code-group

```ts [withdraw.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal } from 'viem/zksync'
// Prepear parameters for initiating the withdrawal.
const withdrawTx = {
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
  from: account.address,
}
// Initiate the withdrawal transaction.
const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx) // [!code focus]
```

```ts [config.ts (Local Account)]
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

### 4. Finalizing the withdrawal

In this step, call on the L1 bridge to complete the withdrawal process is executed, unlocking the funds from the L1 bridge and sending them to the recipient.

:::code-group

```ts [withdraw.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal, finalizeWithdrawal } from 'viem/zksync'
// Prepear parameters for initiating the withdrawal.
const withdrawTx = {
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
  from: account.address,
}
// Initiate the withdrawal transaction.
const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

// Finalize the withdrawal.
const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, { txHash: hash })// [!code focus]
```

```ts [config.ts (Local Account)]
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

### 5. Waiting for Transaction receipt

After sending the Finalize Withdrawal transaction, we can wait for the transaction receipt.

:::code-group

```ts [withdraw.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal, finalizeWithdrawal } from 'viem/zksync'
// Prepear parameters for initiating the withdrawal.
const withdrawTx = {
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
  from: account.address,
}
// Initiate the withdrawal transaction.
const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

// Finalize the withdrawal.
const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
  txHash: hash,
}) 

await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash }) //[!code focus]

```

```ts [config.ts (Local Account)]
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


### 6. Getting the transaction receipt

After the transaction has been processed, we can retrieve it and check the details.

:::code-group

```ts [withdraw.ts]
import { clientL1, clientL2, account } from './config.ts'
import { initiateWithdrawal, finalizeWithdrawal } from 'viem/zksync'
// Prepear parameters for initiating the withdrawal.
const withdrawTx = {
  token: "0x0000000000000000000000000000000000000000",
  amount: 1n,
  to: account.address,
  from: account.address,
}
// Initiate the withdrawal transaction.
const hash = await initiateWithdrawal(clientL1, clientL2, withdrawTx)

// Finalize the withdrawal.
const finalizeWithdrawalHash = await finalizeWithdrawal(clientL1, clientL2, {
  txHash: hash,
}) 

await waitForTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash }) 

await getTransactionReceipt(clientL1, { hash: finalizeWithdrawalHash }) //[!code focus]

```

```ts [config.ts (Local Account)]
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