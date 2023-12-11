---
head:
  - - meta
    - property: og:title
      content: writeEip712Contract
  - - meta
    - name: description
      content: Executes an EIP712 write function on a contract.
  - - meta
    - property: og:description
      content: Executes an EIP712 write function on a contract.

---

# writeEip712Contract

Executes a write function on a contract.

A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](/docs/glossary/terms) is needed to be broadcast in order to change the state.

Internally, `writeEip712Contract` uses a [Wallet Client](/docs/clients/wallet) to call the [`sendEip712Transaction` action](./sendEip712Transaction.md) with [ABI-encoded `data`](/docs/contract/encodeFunctionData).

::: warning

The `writeEip712Contract` internally sends a transaction – it **does not** validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `simulateContract`](#usage) before you execute it.

:::

## Usage

Below is a very basic example of how to execute a write function on a contract (with no arguments).

While you can use `writeEip712Contract` [by itself](#standalone), it is highly recommended to pair it with [`simulateContract`](/docs/contract/simulateContract) to validate that the contract write will execute without errors.

::: code-group

```ts [example.ts]
import { account, publicClient, walletClient } from './config'
import { wagmiAbi } from './abi'
import { writeEip712Contract } from 'viem/chains/zksync'

const { request } = await publicClient.simulateContract({
  account,
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
await writeEip712Contract(walletClient, request)
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zksync } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const walletClient = createWalletClient({
  chain: zksync,
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount(...)
```

:::

### Passing Arguments

If your function requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the function name & ABI, to guard you from inserting the wrong values.

For example, the `mint` function name below requires a **tokenId** argument, and it is typed as `[number]`.

::: code-group

```ts {8} [example.ts]
import { account, publicClient, walletClient } from './client'
import { wagmiAbi } from './abi'
import { writeEip712Contract } from 'viem/chains/zksync'

const { request } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account
})
await writeEip712Contract(walletClient, request)
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "tokenId", type: "uint32" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zkSync } from 'viem/chains'
 
export const walletClient = createWalletClient({
  chain: zkSync,
  transport: custom(window.ethereum),
})

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount('0x...')
```

:::

### Standalone

If you don't need to perform validation on the contract write, you can also use it by itself:

::: code-group

```ts [example.ts]
import { account, walletClient } from './config'
import { wagmiAbi } from './abi'
import { writeEip712Contract } from 'viem/chains/zksync'
 

await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account,
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { zkSync } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const walletClient = createWalletClient({
  chain: zkSync,
  transport: custom(window.ethereum)
})

// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account
export const account = privateKeyToAccount('0x...')
```

:::


## Return Value

[`Hash`](/docs/glossary/types#hash)

A [Transaction Hash](/docs/glossary/terms#hash).

Unlike [`readContract`](/docs/contract/readContract), `writeEip712Contract` only returns a [Transaction Hash](/docs/glossary/terms#hash). If you would like to retrieve the return data of a write function, you can use the [`simulateContract` action](/docs/contract/simulateContract) – this action does not execute a transaction, and does not require gas (it is very similar to `readContract`).

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
await writeEip712Contract(walletClient, {
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
await writeEip712Contract(walletClient, {
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
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint', // [!code focus]
  args: [69420]
})
```

### account

- **Type:** `Account | Address`

The Account to write to the contract from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  accessList: [{ // [!code focus:4]
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    storageKeys: ['0x1'],
  }],
})
```

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420] // [!code focus]
})
```

### chain (optional)

- **Type:** [`Chain`](/docs/glossary/types#chain)
- **Default:** `walletClient.chain`

The target chain. If there is a mismatch between the wallet's current chain & the target chain, an error will be thrown.

The chain is also used to infer its request type (e.g. the Celo chain has a `gatewayFee` that you can pass through to `sendTransaction`).

```ts
import { zksync } from 'viem/chains' // [!code focus]

await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  chain: zksync, // [!code focus]
})
```

### dataSuffix

- **Type:** `Hex`

Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f).

```ts
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  dataSuffix: '0xdeadbeef' // [!code focus]
})
```

### gas (optional)

- **Type:** `bigint`

The gas limit for the transaction. Note that passing a gas limit also skips the gas estimation step.

```ts
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  gas: 69420n, // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#legacy-transaction).

```ts
await writeEip712Contract(walletClient, {
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
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  nonce: 69 // [!code focus]
})
```

### value (optional)

- **Type:** `number`

Value in wei sent with this transaction.

```ts
await writeEip712Contract(walletClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  value: parseEther('1') // [!code focus]
})
```

### gasPerPubdata (optional)

- **Type:** `bigint`

The amount of gas for publishing one byte of data on Ethereum.

```ts
const hash = await writeEip712Contract(walletClient, {
  account,
  abi: wagmiAbi,
  functionName: 'mint',
  gasPerPubdata: 50000, // [!code focus]
  nonce: 69
})
```

### factoryDeps (optional)

- **Type:** `[0x${string}]`

Contains bytecode of the deployed contract.

```ts
const hash = await writeEip712Contract(walletClient, {
  account,
  abi: wagmiAbi,
  functionName: 'mint',
  factoryDeps: ['0xcde...'], // [!code focus]
  nonce: 69
})
```

### paymaster (optional)

- **Type:** `Account | Address`

Address of the paymaster account that will pay the fees. The `paymasterInput` field is required with this one.

```ts
const hash = await writeEip712Contract(walletClient, {
  account,
  abi: wagmiAbi,
  functionName: 'mint',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
  nonce: 69
})
```

### paymasterInput (optional)

- **Type:** `0x${string}`

Input data to the paymaster. The `paymaster` field is required with this one.

```ts
const hash = await writeEip712Contract(walletClient, {
  account,
  abi: wagmiAbi,
  functionName: 'mint',
  paymaster: '0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021', // [!code focus]
  paymasterInput: '0x8c5a...' // [!code focus]
  nonce: 69
})
```
