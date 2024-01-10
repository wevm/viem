---
outline: deep
description: Initiates a withdrawal on an L2 to the L1.
---

# initiateWithdrawal

Initiates a [withdrawal](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L2 to the L1. 

Internally performs a contract write to the [`initiateWithdrawal` function](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol#L73) on the [Optimism L2ToL1MessagePasser predeploy contract](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol).

## Usage

:::code-group

```ts [example.ts]
import { base } from 'viem/chains'
import { account, walletClientL2 } from './config'
 
const hash = await walletClientL2.initiateWithdrawal({
  account,
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  },
})
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { walletActionsL2 } from 'viem/op-stack'

export const walletClientL2 = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(walletActionsL2())

// JSON-RPC Account
export const [account] = await walletClientL2.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::


:::warning

You must [build the parameters](#building-parameters) on the L1 before calling this function. If the gas is too low, transaction execution will fail on the L1.

:::

### Building Parameters

The [`buildInitiateWithdrawal` Action](/op-stack/actions/buildInitiateWithdrawal) builds & prepares the initiate withdrawal transaction parameters. 

We can use the resulting `args` to initiate the withdrawal transaction on the L2.

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

export const walletClientL2 = createWalletClient({
  chain: optimism,
  transport: custom(window.ethereum)
}).extend(walletActionsL2())

// JSON-RPC Account
export const [account] = await walletClientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

[See more on the `buildInitiateWithdrawal` Action.](/op-stack/actions/buildInitiateWithdrawal)


### Account Hoisting

If you do not wish to pass an `account` to every `proveWithdrawal`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more.](/docs/clients/wallet#account)

:::code-group

```ts [example.ts]
import { account, publicClientL1, walletClientL2 } from './config'

const args = await publicClientL1.buildInitiateWithdrawal({ 
  account, // [!code --]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
  value: parseEther('1'), 
}) 
 
const hash = await walletClientL2.initiateWithdrawal(args)
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, createPublicClient, custom, http } from 'viem'
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
  account, // [!code hl]
  chain: optimism,
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

[`Hash`](/docs/glossary/types#hash)

The [L2 Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  },
  targetChain: base,
})
```

### args.data (optional)

- **Type:** `Hex`

Encoded contract method & arguments.

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    data: '0x...', // [!code focus]
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
})
```

### args.gas

- **Type:** `bigint`

Gas limit for transaction execution on the L1.

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n, // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  },
})
```

### args.to

- **Type:** `Address`

L1 Transaction recipient.

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',  // [!code focus]
    value: parseEther('1')
  },
})
```

### args.value (optional)

- **Type:** `bigint`

Value in wei to withdrawal from the L2 to the L1. Debited from the caller's L2 balance.

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1') // [!code focus]
  },
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `client.chain`

The L2 chain. If there is a mismatch between the wallet's current chain & this chain, an error will be thrown.

```ts
import { optimism } from 'viem/chains'

const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  chain: optimism, // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. 

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  maxFeePerGas: parseGwei('20'),  // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  maxFeePerGas: parseGwei('20'), 
  maxPriorityFeePerGas: parseGwei('2'),  // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const hash = await client.initiateWithdrawal({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  nonce: 69, // [!code focus]
})
```

