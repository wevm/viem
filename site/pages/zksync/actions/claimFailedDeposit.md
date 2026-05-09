---
description: Withdraws funds from the initiated deposit, which failed when finalizing on L2.
---

# claimFailedDeposit

Withdraws funds from the initiated deposit, which failed when finalizing on L2.
If the deposit L2 transaction has failed, it sends an L1 transaction calling `claimFailedDeposit` method of the
L1 bridge, which results in returning L1 tokens back to the depositor.

## Usage

:::code-group

```ts [example.ts]
import { account, walletClient, zksyncClient } from './config'
import { legacyEthAddress } from 'viem/zksync'

const hash = await walletClient.claimFailedDeposit({
  account,
  client: zksyncClient,
  depositHash: '<L2_HASH_OF_FAILED_DEPOSIT>'
})
```

```ts [config.ts]
import { createWalletClient, createPublicClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync, mainnet } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `claimFailedDeposit`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { walletClient, zksyncClient } from './config'
import { legacyEthAddress } from 'viem/zksync'

const hash = await walletClient.claimFailedDeposit({
  client: zksyncClient,
  depositHash: '<L2_HASH_OF_FAILED_DEPOSIT>'
})
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'
import { zksync } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

// Retrieve Account from an EIP-1193  Provider. // [!code focus]
const [account] = await window.ethereum.request({  // [!code focus]
  method: 'eth_requestAccounts' // [!code focus]
}) // [!code focus]

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum) // [!code focus]
}).extend(walletActionsL1())
```

```ts [config.ts (Local Account)]
import { createWalletClient, custom } from 'viem'
import { zksync } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { publicActionsL2, walletActionsL1 } from 'viem/zksync'

export const zksyncClient = createPublicClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(publicActionsL2())

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code focus]
  transport: custom(window.ethereum)
}).extend(walletActionsL1())
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### client

- **Type:** `Client`

The L2 client for fetching data from L2 chain.

```ts
const hash = await walletClient.claimFailedDeposit({
  client: zksyncClient, // [!code focus]
  depositHash: '<L2_HASH_OF_FAILED_DEPOSIT>'
})
```

### depositHash

- **Type:** `Hash`

The L2 transaction hash of the failed deposit.

```ts
const hash = await walletClient.claimFailedDeposit({
  client: zksyncClient,
  depositHash: '<L2_HASH_OF_FAILED_DEPOSIT>', // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await walletClient.claimFailedDeposit({
  chain: zksync, // [!code focus]
  client: zksyncClient,
  depositHash: '<L2_HASH_OF_FAILED_DEPOSIT>'
})
```