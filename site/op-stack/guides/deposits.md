---
head:
  - - meta
    - property: og:title
      content: Deposits
  - - meta
    - name: description
      content: How to deposit from Mainnet to OP Stack chains.
  - - meta
    - property: og:description
      content: How to deposit from Mainnet to OP Stack chains.

---

# Deposits

This guide will demonstrate how to deposit (bridge) **1 Ether** from **Mainnet** to **[Optimism (OP Mainnet)](https://www.optimism.io/)**.

## Overview

::: code-group

```ts [deposit.ts]
import { getL2TransactionHashes } from 'viem/op-stack'
import { optimismClient, mainnetClient } from './config'

// Build parameters for the transaction on the L2.
const request = await optimismClient.buildDepositTransaction({
  mint: parseEther('1')
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
 
// Execute the deposit transaction on the L1.
const hash = await mainnetClient.depositTransacton(request)

// Wait for the L1 transaction to be processed.
const receipt = await mainnetClient.waitForTransactionReceipt({ hash })

// Get the L2 transaction hash from the L1 transaction receipt.
const [l2Hash] = getL2TransactionHashes(receipt)

// Wait for the L2 transaction to be processed.
const l2Receipt = await optimismClient.waitForTransactionReceipt({ 
  hash: l2Hash 
})
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, optimism } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/op-stack'

// Retrieve Account from an EIP-1193 Provider. // [!code hl]
const [account] = await window.ethereum.request({ // [!code hl]
  method: 'eth_requestAccounts' // [!code hl]
}) // [!code hl]

export const mainnetClient = createWalletClient({
  account, // [!code hl]
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

export const optimismClient = createPublicClient({
  chain: optimism,
  transport: http()
}).extend(publicActionsL2())
```

```ts [config.ts (Local Account)]
import { createWalletClient, createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, optimism } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/op-stack'

export const mainnetClient = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code hl]
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

export const optimismClient = createPublicClient({
  chain: optimism,
  transport: http()
}).extend(publicActionsL2())
```

:::