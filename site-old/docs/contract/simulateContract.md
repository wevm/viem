---
head:
  - - meta
    - property: og:title
      content: simulateContract
  - - meta
    - name: description
      content: Simulates & validates a contract interaction.
  - - meta
    - property: og:description
      content: Simulates & validates a contract interaction.

---

# simulateContract

The `simulateContract` function **simulates**/**validates** a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.

This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](/docs/contract/readContract), but also supports contract write functions.

Internally, `simulateContract` uses a [Public Client](/docs/clients/public) to call the [`call` action](/docs/actions/public/call) with [ABI-encoded `data`](/docs/contract/encodeFunctionData).

## Usage

Below is a very basic example of how to simulate a write function on a contract (with no arguments).

The `mint` function accepts no arguments, and returns a token ID.

::: code-group

```ts [example.ts]
import { account, publicClient } from './config'
import { wagmiAbi } from './abi'

const { result } = await publicClient.simulateContract({
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
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const [account] = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Passing Arguments

If your function requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the function name & ABI, to guard you from inserting the wrong values.

For example, the `mint` function name below requires a **tokenId** argument, and it is typed as `[number]`.

::: code-group

```ts {9} [example.ts]
import { account, publicClient } from './config'
import { wagmiAbi } from './abi'

const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account,
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "owner", type: "uint32" }],
    name: "mint",
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const [account] = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Pairing with `writeContract`

The `simulateContract` function also pairs well with `writeContract`.

In the example below, we are **validating** if the contract write will be successful via `simulateContract`. If no errors are thrown, then we are all good. After that, we perform a contract write to execute the transaction.

::: code-group

```ts [example.ts]
import { account, walletClient, publicClient } from './config'
import { wagmiAbi } from './abi'

const { request } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account,
})
const hash = await walletClient.writeContract(request)
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  ...
] as const;
```

```ts [config.ts]
import { createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const [account] = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

### Handling Custom Errors

In the example below, we are **catching** a [custom error](https://blog.soliditylang.org/2021/04/21/custom-errors/) thrown by the `simulateContract`. It is important to include the custom error item in the contract `abi`.

You can access the custom error through the `data` attribute of the error:

::: code-group

```ts {13-27} [example.ts]
import { BaseError, ContractFunctionRevertedError } from 'viem';
import { account, walletClient, publicClient } from './config'
import { wagmiAbi } from './abi'

try {
  await publicClient.simulateContract({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    abi: wagmiAbi,
    functionName: 'mint',
    account,
  })
} catch (err) {
  if (err instanceof BaseError) {
    const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? ''
      // do something with `errorName`
    }
  }
}

```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "mint",
    outputs: [{ name: "", type: "uint32" }],
    stateMutability: "view",
    type: "function",
  },
  // Custom solidity error
  {
    type: 'error',
    inputs: [],
    name: 'MintIsDisabled'
  },
  ...
] as const;
```

```solidity [WagmiExample.sol]
// ...
error MintIsDisabled();
contract WagmiExample {
  // ...

    function mint() public {
      // ...
      revert MintIsDisabled();
      // ...
    }

  // ...
}
```

```ts [config.ts]
import { createPublicClient, custom, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

// JSON-RPC Account
export const [account] = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
// Local Account
export const account = privateKeyToAccount(...)

export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Return Value

The simulation result and write request. Type is inferred.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### functionName

- **Type:** `string`

A function to extract from the ABI.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint', // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### account

- **Type:** `Account | Address`

The Account to simulate the contract method from.

Accepts a [JSON-RPC Account](/docs/clients/wallet#json-rpc-accounts) or [Local Account (Private Key, etc)](/docs/clients/wallet#local-accounts-private-key-mnemonic-etc).

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#accesslist)

The access list.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  accessList: [{ // [!code focus:4]
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    storageKeys: ['0x1'],
  }],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```


### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const { result } = await publicClient.simulateContract({
  address: '0x1dfe7ca09e99d10835bf73044a23b73fc20623df',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'], // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
})
```

### dataSuffix

- **Type:** `Hex`

Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f).

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  dataSuffix: '0xdeadbeef' // [!code focus]
})
```

### gas (optional)

- **Type:** `bigint`

The gas limit for the transaction.

```ts
await walletClient.writeContract({
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
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  gasPrice: parseGwei('20'), // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Total fee per gas (in wei), inclusive of `maxPriorityFeePerGas`. Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  maxFeePerGas: parseGwei('20'),  // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Max priority fee per gas (in wei). Only applies to [EIP-1559 Transactions](/docs/glossary/terms#eip-1559-transaction)

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'), // [!code focus]
})
```

### nonce (optional)

- **Type:** `number`

Unique number identifying this transaction.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  nonce: 69 // [!code focus]
})
```

### value (optional)

- **Type:** `number`

Value in wei sent with this transaction.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  value: parseEther('1') // [!code focus]
})
```



### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const { result } = await publicClient.simulateContract({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  blockTag: 'safe', // [!code focus]
})
```

## Live Example

Check out the usage of `simulateContract` in the live [Writing to Contracts Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts_writing-to-contracts) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts_writing-to-contracts?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
