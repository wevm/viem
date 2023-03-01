---
head:
  - - meta
    - property: og:title
      content: writeContract
  - - meta
    - name: description
      content: Executes a write function on a contract.
  - - meta
    - property: og:description
      content: Executes a write function on a contract.

---

# writeContract

Executes a write function on a contract.

A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](/docs/glossary/terms) is needed to be broadcast in order to change the state. 

Internally, `writeContract` uses a [Wallet Client](/docs/clients/wallet) to call the [`sendTransaction` action](/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](/docs/contract/encodeFunctionData).

::: warning

The `writeContract` internally sends a transaction – it **does not** validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `simulateContract`](#usage) before you execute it. 

:::

## Usage

Below is a very basic example of how to execute a write function on a contract (with no arguments).

While you can use `writeContract` [by itself](#standalone), it is highly recommended to pair it with [`simulateContract`](/docs/contracts/simulateContract) to validate that the contract write will execute without errors.

::: code-group

```ts [example.ts]
import { publicClient, walletClient } from './client'
import { wagmiAbi } from './abi'

const { request } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
await walletClient.writeContract(request)
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

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

### Passing Arguments

If your function requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the function name & ABI, to guard you from inserting the wrong values.

For example, the `mint` function name below requires a **tokenId** argument, and it is typed as `[number]`.

::: code-group

```ts {9} [example.ts]
import { walletClient } from './client'
import { wagmiAbi } from './abi'

const { request } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
await walletClient.writeContract(request)
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

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::

### Standalone

If you don't need to perform validation on the contract write, you can also use it by itself:

::: code-group

```ts [example.ts]
import { walletClient } from './client'
import { wagmiAbi } from './abi'

await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
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

```ts [client.ts]
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

:::


## Return Value

`Hash`

A [Transaction Hash](/docs/glossary/terms#TODO).

Unlike [`readContract`](/docs/contract/readContract), `writeContract` only returns a [Transaction Hash](/docs/glossary/terms#TODO). If you would like to retrieve the return data of a write function, you can use the [`simulateContract` action](/docs/contract/simulateContract) – this action does not execute a transaction, and does not require gas (it is very similar to `readContract`).

## Parameters

### address

- **Type:** `Address`

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

- **Type:** [`Abi`](/docs/glossary/types#TODO)

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

- **Type:** `Address`

The Account sender. [Read more](/docs/clients/wallet).

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266') // [!code focus]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#TODO)

The access list.

```ts
await walletClient.writeContract({
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
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420] // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#TODO).

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#TODO)

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  maxFeePerGas: parseGwei('20'),  // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#TODO)

```ts
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
await walletClient.writeContract({
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
await walletClient.writeContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  value: parseEther('1') // [!code focus]
})
```

## Live Example

Check out the usage of `writeContract` in the live [Writing to Contracts Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0"></iframe>
