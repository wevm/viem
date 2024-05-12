---
outline: deep
description: Initiates a deposit transaction on an L1, which executes a transaction on an L2.
---

# depositTransaction

Initiates a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L1, which executes a transaction on an L2. 

Internally performs a contract write to the [`depositTransaction` function](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol#L378) on the [Optimism Portal contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol).

## Usage

:::code-group

```ts [example.ts]
import { base } from 'viem/chains'
import { account, walletClientL1 } from './config'
 
const hash = await walletClientL1.depositTransaction({
  account,
  request: {
    gas: 21_000n,
    mint: parseEther('1')
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  },
  targetChain: base,
})
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { walletActionsL1 } from 'viem/op-stack'

export const walletClientL1 = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
}).extend(walletActionsL1())

// JSON-RPC Account
export const [account] = await walletClientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::


:::warning

You must [build the parameters](#building-parameters) on the L2 before calling this function. If the gas is too low, transaction execution will fail on the L2.

:::

### Building Parameters

The [`buildDepositTransaction` Action](/op-stack/actions/buildDepositTransaction) builds & prepares the deposit transaction parameters (ie. `gas`, `targetChain`, etc). 

We can use the resulting `args` to initiate the deposit transaction on the L1.

:::code-group

```ts [example.ts]
import { account, publicClientL2, walletClientL1 } from './config'

// Build parameters for the transaction on the L2.
const args = await publicClientL2.buildDepositTransaction({
  account,
  mint: parseEther('1')
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
 
// Execute the deposit transaction on the L1.
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
export const [account] = await clientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

[See more on the `buildDepositTransaction` Action.](/op-stack/actions/buildDepositTransaction)


### Account Hoisting

If you do not wish to pass an `account` to every `depositTransaction`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more.](/docs/clients/wallet#account)

:::code-group

```ts [example.ts]
import { publicClientL2, walletClientL1 } from './config'

// Prepare parameters for the deposit transaction on the L2.
const args = await publicClientL2.buildDepositTransaction({
  mint: parseEther('1')
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
})
 
// Initiate the deposit transaction on the L1.
const hash = await walletClientL1.depositTransaction(args)
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, createPublicClient, custom, http } from 'viem'
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

[`Hash`](/docs/glossary/types#hash)

The [L1 Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const hash = await client.depositTransaction({
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

Contract deployment bytecode or encoded contract method & arguments.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    data: '0x...', // [!code focus]
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  targetChain: base,
})
```

### args.gas

- **Type:** `bigint`

Gas limit for transaction execution on the L2.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n, // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  },
  targetChain: base,
})
```

### args.isCreation (optional)

- **Type:** `boolean`

Whether or not this is a contract deployment transaction.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    data: '0x...',
    gas: 69_420n,
    isCreation: true // [!code focus]
  },
  targetChain: base,
})
```

### args.mint (optional)

- **Type:** `bigint`

Value in wei to mint (deposit) on the L2. Debited from the caller's L1 balance.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    mint: parseEther('1') // [!code focus]
  },
  targetChain: base,
})
```

### args.to (optional)

- **Type:** `Address`

L2 Transaction recipient.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',  // [!code focus]
    value: parseEther('1')
  },
  targetChain: base,
})
```

### args.value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction on the L2. Debited from the caller's L2 balance.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1') // [!code focus]
  },
  targetChain: base,
})
```

### targetChain

- **Type:** [`Chain`](/docs/glossary/types#chain)

The L2 chain to execute the transaction on.

```ts
import { mainnet } from 'viem/chains'

const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  chain: mainnet,
  targetChain: base, // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `client.chain`

The L1 chain. If there is a mismatch between the wallet's current chain & this chain, an error will be thrown.

```ts
import { mainnet } from 'viem/chains'

const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  chain: mainnet, // [!code focus]
  targetChain: base,
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. 

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  maxFeePerGas: parseGwei('20'),  // [!code focus]
  targetChain: base,
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  maxFeePerGas: parseGwei('20'), 
  maxPriorityFeePerGas: parseGwei('2'),  // [!code focus]
  targetChain: base,
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  nonce: 69, // [!code focus]
  targetChain: base,
})
```

### portalAddress (optional)

- **Type:** `Address`
- **Default:** `targetChain.contracts.portal[chainId].address`

The address of the [Optimism Portal contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol). Defaults to the Optimism Portal contract specified on the `targetChain`.

If a `portalAddress` is provided, the `targetChain` parameter becomes optional.

```ts
const hash = await client.depositTransaction({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```
