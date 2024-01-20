---
outline: deep
description: Builds & prepares parameters for a withdrawal to be initiated on an L2.
---

# buildInitiateWithdrawal

Builds & prepares parameters for a [withdrawal](https://community.optimism.io/docs/protocol/withdrawal-flow/#withdrawal-initiating-transaction) to be initiated on an L2.

## Usage

:::code-group

```ts [example.ts]
import { account, publicClientL1, walletClientL2 } from './config'

const args = await publicClientL1.buildInitiateWithdrawal({ // [!code hl]
  account, // [!code hl]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code hl]
  value: parseEther('1'), // [!code hl]
}) // [!code hl]
 
const hash = await walletClientL2.initiateWithdrawal(args)
```

```ts [config.ts]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, optimism } from 'viem/chains'
import { publicActionsL1, walletActionsL2 } from 'viem/op-stack'

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http()
}).extend(publicActionsL1())

export const walletClientL1 = createWalletClient({
  chain: optimism,
  transport: custom(window.ethereum)
}).extend(walletActionsL2())

// JSON-RPC Account
export const [account] = await walletClientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::


### Account Hoisting

If you do not wish to pass an `account` to every `buildInitiateWithdrawal`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { publicClientL1, walletClientL2 } from './config'

const args = await publicClientL1.buildInitiateWithdrawal({
  mint: parseEther('1')
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
 
const hash = await walletClientL2.initiateWithdrawal(args)
```

```ts [config.ts (JSON-RPC Account)]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, optimism } from 'viem/chains'
import { publicActionsL1, walletActionsL2 } from 'viem/op-stack'

// Retrieve Account from an EIP-1193 Provider. // [!code hl]
const [account] = await window.ethereum.request({ // [!code hl]
  method: 'eth_requestAccounts' // [!code hl]
}) // [!code hl]

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http()
}).extend(publicActionsL1())

export const walletClientL2 = createWalletClient({
  chain: optimism,
  account, // [!code hl]
  transport: custom(window.ethereum)
}).extend(walletActionsL2())
```

```ts [config.ts (Local Account)]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, optimism } from 'viem/chains'
import { publicActionsL1, walletActionsL2 } from 'viem/op-stack'

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http()
}).extend(publicActionsL1())

export const walletClientL2 = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code hl]
  chain: optimism,
  transport: custom(window.ethereum)
}).extend(walletActionsL2())
```

:::

## Returns

`InitiateWithdrawalParameters`

The parameters required to initiate a [withdrawal](/op-stack/actions/initiateWithdrawal).

## Parameters

### account (optional)

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const args = await client.buildInitiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### data (optional)

- **Type:** `Hex`

Encoded contract method & arguments.

```ts
const args = await client.buildInitiateWithdrawal({
  data: '0x...', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gas (optional)

- **Type:** `bigint`

Gas limit for transaction execution on the L1.

```ts
const args = await client.buildInitiateWithdrawal({
  gas: 21_000n, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### to (optional)

- **Type:** `Address`

L1 recipient.

```ts
const args = await client.buildInitiateWithdrawal({
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',  // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

Value in wei to withdrawal from the L2 to the L1. Debited from the caller's L2 balance.

```ts
const args = await client.buildInitiateWithdrawal({
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
  value: parseEther('1') // [!code focus]
})
```