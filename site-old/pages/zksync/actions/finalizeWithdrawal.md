---
description: Proves the inclusion of the `L2->L1` withdrawal message.
---

# finalizeWithdrawal

Proves the inclusion of the `L2->L1` withdrawal message.

## Usage

:::code-group

```ts [example.ts]
import { account, walletClient, zksyncClient } from './config'

const hash = await walletClient.finalizeWithdrawal({
  account,
  client: zksyncClient,
  hash: '0x…',
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

If you do not wish to pass an `account` to every `finalizeWithdrawal`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { walletClient, zksyncClient } from './config'
 
const hash = await walletClient.finalizeWithdrawal({
  client: zksyncClient,
  hash: '0x…',
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
const hash = await walletClient.finalizeWithdrawal({
  client: zksyncClient, // [!code focus]
  hash: '0x…',
})
```

### hash 

- **Type:** `Hex`

Hash of the L2 transaction where the withdrawal was initiated.

```ts
const hash = await walletClient.finalizeWithdrawal({
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
const hash = await walletClient.finalizeWithdrawal({
  client: zksyncClient,
  hash: '0x…',
  index: 0n, // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await walletClient.finalizeWithdrawal({
  chain: zksync, // [!code focus]
  client: zksyncClient,
  hash: '0x…',
})
```