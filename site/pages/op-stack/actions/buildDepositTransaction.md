---
outline: deep
description: Builds & prepares parameters for a deposit transaction to be initiated on an L1 and executed on the L2.
---

# buildDepositTransaction

Builds & prepares parameters for a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) to be initiated on an L1 and executed on the L2.

## Usage

:::code-group

```ts [example.ts]
import { account, publicClientL2, walletClientL1 } from './config'

const args = await publicClientL2.buildDepositTransaction({ // [!code hl]
  account, // [!code hl]
  mint: parseEther('1'), // [!code hl]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code hl]
}) // [!code hl]
 
const hash = await walletClientL1.depositTransaction(args)
```

```ts [config.ts]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, base } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/op-stack'

export const walletClientL1 = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

export const publicClientL2 = createPublicClient({
  chain: base,
  transport: http()
}).extend(publicActionsL2())

// JSON-RPC Account
export const [account] = await walletClientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::


### Account Hoisting

If you do not wish to pass an `account` to every `buildDepositTransaction`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { publicClientL2, walletClientL1 } from './config'

const args = await publicClientL2.buildDepositTransaction({
  mint: parseEther('1')
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
 
const hash = await walletClientL1.depositTransaction(args)
```

```ts [config.ts (JSON-RPC Account)]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, base } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/op-stack'

// Retrieve Account from an EIP-1193 Provider. // [!code hl]
const [account] = await window.ethereum.request({ // [!code hl]
  method: 'eth_requestAccounts' // [!code hl]
}) // [!code hl]

export const walletClientL1 = createWalletClient({
  account, // [!code hl]
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

export const publicClientL2 = createPublicClient({
  chain: base,
  transport: http()
}).extend(publicActionsL2())
```

```ts [config.ts (Local Account)]
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet, base } from 'viem/chains'
import { publicActionsL2, walletActionsL1 } from 'viem/op-stack'

export const walletClientL1 = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code hl]
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

export const publicClientL2 = createPublicClient({
  chain: base,
  transport: http()
}).extend(publicActionsL2())
```

:::

## Returns

`DepositTransactionParameters`

The parameters required to execute a [deposit transaction](/op-stack/actions/depositTransaction).

## Parameters

### account (optional)

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const args = await client.buildDepositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### data (optional)

- **Type:** `Hex`

Contract deployment bytecode or encoded contract method & arguments.

```ts
const args = await client.buildDepositTransaction({
  data: '0x...', // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
```

### gas (optional)

- **Type:** `bigint`

Gas limit for transaction execution on the L2.

```ts
const args = await client.buildDepositTransaction({
  gas: 21_000n, // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: parseEther('1')
})
```

### isCreation (optional)

- **Type:** `boolean`

Whether or not this is a contract deployment transaction.

```ts
const args = await client.buildDepositTransaction({
  data: '0x...',
  isCreation: true // [!code focus]
})
```

### mint (optional)

- **Type:** `bigint`

Value in wei to mint (deposit) on the L2. Debited from the caller's L1 balance.

```ts
const args = await client.buildDepositTransaction({
  mint: parseEther('1') // [!code focus]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
})
```

### to (optional)

- **Type:** `Address`

L2 Transaction recipient.

```ts
const args = await client.buildDepositTransaction({
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',  // [!code focus]
  value: parseEther('1')
})
```

### value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction on the L2. Debited from the caller's L2 balance.

```ts
const args = await client.buildDepositTransaction({
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
  value: parseEther('1') // [!code focus]
})
```