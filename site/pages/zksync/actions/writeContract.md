---
description: Executes a write function on a contract, with EIP712 transaction support.
---

# writeContract

Executes a write function on a contract, with EIP712 transaction support.

## Usage

:::code-group

```ts [example.ts]
import { account, walletClient } from './config'

const hash = await walletClient.writeContract({ // [!code focus:99]
  account,
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
// '0x...'
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync } from 'viem/chains'
import { eip712WalletActions } from 'viem/zksync'

export const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum)
}).extend(eip712WalletActions())

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `sendTransaction`, you can also hoist the Account on the Wallet Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts [example.ts]
import { walletClient } from './config'
 
const hash = await walletClient.writeContract({ // [!code focus:99]
  account,
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
// '0x...'
```

```ts [config.ts (JSON-RPC Account)]
import { createWalletClient, custom } from 'viem'
import { eip712WalletActions } from 'viem/zksync'

// Retrieve Account from an EIP-712 Provider. // [!code focus]
const [account] = await window.ethereum.request({  // [!code focus]
  method: 'eth_requestAccounts' // [!code focus]
}) // [!code focus]

export const walletClient = createWalletClient({
  account,
  transport: custom(window.ethereum) // [!code focus]
}).extend(eip712WalletActions())
```

```ts [config.ts (Local Account)]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { eip712WalletActions } from 'viem/zksync'

export const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'), // [!code focus]
  transport: custom(window.ethereum)
}).extend(eip712WalletActions())
```

:::

## Returns

[`Hash`](/docs/glossary/types#hash)

The [Transaction](/docs/glossary/terms#transaction) hash.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  functionName: 'mint',
  args: [69420]
})
```

### functionName

- **Type:** `string`

A function to extract from the ABI.

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint', // [!code focus]
  args: [69420]
})
```

### account

- **Type:** `Account | Address`

The Account to send the transaction from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts
const hash = await walletClient.writeContract({
  accessList: [ // [!code focus:6]
    {
      address: '0x1',
      storageKeys: ['0x1'],
    },
  ],
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

```ts
import { zksync } from 'viem/chains' // [!code focus]

const hash = await walletClient.writeContract({
  chain: zksync, // [!code focus]
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
```

### data (optional)

- **Type:** `0x${string}`

A contract hashed method call with encoded args.

```ts
const hash = await walletClient.writeContract({
  data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // [!code focus]
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  nonce: 69 // [!code focus]
})
```

### value (optional)

- **Type:** `bigint`

Value in wei sent with this transaction.

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  value: parseEther('1'), // [!code focus]
})
```

### gasPerPubdata (optional)

- **Type:** `bigint`

The amount of gas for publishing one byte of data on Ethereum.

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  gasPerPubdata: 50000, // [!code focus]
})
```

### factoryDeps (optional)

- **Type:** `[0x${string}]`

Contains bytecode of the deployed contract.

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  factoryDeps: ['0xcde...'], // [!code focus]
})
```

### paymaster (optional)

- **Type:** `Account | Address`

Address of the paymaster account that will pay the fees. The `paymasterInput` field is required with this one.

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
})
```

### paymasterInput (optional)

- **Type:** `0x${string}`

Input data to the paymaster. The `paymaster` field is required with this one.

```ts
const hash = await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
})
```