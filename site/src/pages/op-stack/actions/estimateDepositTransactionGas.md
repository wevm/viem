---
outline: deep
description: Estimates gas to initiate a deposit transaction on an L1, which executes a transaction on an L2.
---

# estimateDepositTransactionGas

Estimates gas to initiate a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L1, which executes a transaction on an L2. 

## Usage

:::code-group

```ts [example.ts]
import { base } from 'viem/chains'
import { account, publicClientL1 } from './config'
 
const gas = await publicClientL1.estimateDepositTransactionGas({
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
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { publicActionsL1 } from 'viem/op-stack'

export const publicClientL1 = createPublicClient({
  chain: mainnet,
  transport: http()
}).extend(publicActionsL1())

// JSON-RPC Account
export const [account] = await publicClientL1.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

## Returns

`bigint`

Gas required to execute the transaction on the L1.

## Parameters

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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

const gas = await client.estimateDepositTransactionGas({
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

const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
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
const gas = await client.estimateDepositTransactionGas({
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  request: {
    gas: 21_000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', 
    value: parseEther('1')
  },
  portalAddress: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' // [!code focus]
})
```