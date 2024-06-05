---
head:
  - - meta
    - property: og:title
      content: Deposits
  - - meta
    - name: description
      content: How to deposit from Mainnet to zkSync Era chains.
  - - meta
    - property: og:description
      content: How to deposit from Mainnet to zkSync Era chains.

---

# Deposits

This guide will demonstrate how to deposit (bridge) **1 Ether** from **Mainnet** to **[zkSync Era](https://zksync.io/)**.

## Overview

Here is an end-to-end overview of how to execute a deposit transaction. We will break it down into [Steps](#steps) below.


:::code-group

```ts [deposit.ts]
// Build parameters for the transaction with L1 and L2 clients.
const depositArgs = await deposit(clientL1, clientL2, {
  amount,
  refundRecipient: account.address,
})
// Execute deposit transaction on the L1.
const hash = await sendTransaction(clientL1, depositArgs)

// Wait for transaction to be processed on L1.
await waitForTransactionReceipt(clientL1, { hash })

// Get the L1 transaction receipt.
const l1TxReceipt = await getTransactionReceipt(clientL1, { hash })

// Get the L2 transaction receipt.
const l2TxReceipt = await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
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

### 2. Build the Deposit Transaction

Next, we will build the deposit transaction on the zkSync (L2) chain using the Clients that we created in the previous step.

In the example below, we want to deposit **1 Ether** onto the zkSync chain, to ourselves (`account.address`).

:::info

You can also use someone else's address as the `to` value if you wanted to.

:::

:::code-group

```ts [deposit.ts]
// Build parameters for the transaction with L1 and L2 clients.
const depositArgs = await deposit(clientL1, clientL2, {
  amount,
  refundRecipient: account.address,
})
```

```ts [config.ts (Local Account)]
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

### 3. Execute the Deposit Transaction

After that, we will execute the deposit transaction on the Mainnet (L1) chain.

:::code-group

```ts [deposit.ts]
// Build parameters for the transaction with L1 and L2 clients.
const depositArgs = await deposit(clientL1, clientL2, {
  amount,
  refundRecipient: account.address,
})

// Execute deposit transaction on the L1.
const hash = await sendTransaction(clientL1, depositArgs) // [!code focus]

```

```ts [config.ts (Local Account)]
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

### 4. Wait for Transaction to be Processed

Once we have broadcast the transaction to the Mainnet (L1) chain, we need to wait for it to be processed on a block so we can extract the transaction receipt. We will need the transaction receipt to extract the transaction on the zkSync (L2) chain.

:::code-group

```ts [deposit.ts]
// Build parameters for the transaction with L1 and L2 clients.
const depositArgs = await deposit(clientL1, clientL2, {
  amount,
  refundRecipient: account.address,
})

// Execute deposit transaction on the L1.
const hash = await sendTransaction(clientL1, depositArgs)

// Wait for transaction to be processed on L1.
await waitForTransactionReceipt(clientL1, { hash })

```

```ts [config.ts (Local Account)]
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

### 5. Return L1 Transaction Receipt

TODO...


:::code-group

```ts [deposit.ts]
// Build parameters for the transaction with L1 and L2 clients.
const depositArgs = await deposit(clientL1, clientL2, {
  amount,
  refundRecipient: account.address,
})

// Execute deposit transaction on the L1.
const hash = await sendTransaction(clientL1, depositArgs)

// Wait for transaction to be processed on L1.
await waitForTransactionReceipt(clientL1, { hash })

// Get the L1 transaction receipt.
const l1TxReceipt = await getTransactionReceipt(clientL1, { hash }) // [!code focus]


```

```ts [config.ts (Local Account)]
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


### 6. Return L2 Transaction Receipt

Now that we have the Transaction Receipt from L1, we can wait for the transaction to be processed on the zkSync (L2) chain. 

Once the `getL2TransactionFromPriorityOp` call resolves, the transaction has been processed on L2 and you should now be credited with 1 Ether on the zkSync (L2) chain.

:::code-group

```ts [deposit.ts]
// Build parameters for the transaction with L1 and L2 clients.
const depositArgs = await deposit(clientL1, clientL2, {
  amount,
  refundRecipient: account.address,
})

// Execute deposit transaction on the L1.
const hash = await sendTransaction(clientL1, depositArgs)

// Wait for transaction to be processed on L1.
await waitForTransactionReceipt(clientL1, { hash })

// Get the L1 transaction receipt.
const l1TxReceipt = await getTransactionReceipt(clientL1, { hash }) 

// Get the L2 transaction receipt.
const l2TxReceipt = await getL2TransactionFromPriorityOp(clientL2, {  // [!code focus]
      l1TransactionReceipt: l1TxReceipt, // [!code focus]
    }), // [!code focus]

```

```ts [config.ts (Local Account)]
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