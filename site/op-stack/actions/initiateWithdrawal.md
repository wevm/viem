---
outline: deep
head:
  - - meta
    - property: og:title
      content: initiateWithdrawal
  - - meta
    - name: description
      content: Initiates a withdrawal on an L2 to the L1.
  - - meta
    - property: og:description
      content: Initiates a withdrawal on an L2 to the L1.
---

# initiateWithdrawal

Initiates a [withdrawal](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L2 to the L1. 

Internally performs a contract write to the [`initiateWithdrawal` function](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol#L73) on the [Optimism L2ToL1MessagePasser predeploy contract](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol).

## Usage

::: code-group

```ts [example.ts]
import { base } from 'viem/chains'
import { account, walletClientL2 } from './config'
 
const hash = await walletClientL2.initiateWithdrawal({
  account,
  args: {
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


::: warning

You must [build the parameters](#building-parameters) on the L1 before calling this function. If the gas is too low, transaction execution will fail on the L1.

:::

### Building Parameters

TODO


### Account Hoisting

TODO

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
  args: {
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
  args: {
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
  args: {
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
  args: {
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
  args: {
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
  args: {
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
  args: {
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
  args: {
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
  args: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  nonce: 69, // [!code focus]
})
```

