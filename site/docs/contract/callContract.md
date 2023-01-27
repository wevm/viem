# callContract

The `callContract` function allows for the execution of a **read** or **write** function on a contract, and returns the response.

It is similar to [`readContract`](/docs/contract/readContract), in that it does not require gas to execute and _**does not**_ change the state of the blockchain, but also supports **contract write** functions. 

It is useful for:

- **simulating** or **validating** a contract interaction.
- retrieving **return data** (and **revert reasons**) of write functions (via `writeContract`).

Internally, `callContract` uses a [Public Client](/docs/clients/public) to call the [`call` action](/docs/actions/public/call) with [ABI-encoded `data`](/docs/contract/encodeFunctionData).

## Import

```ts
import { callContract } from 'viem'
```

## Usage

Below is a very basic example of how to call a write function on a contract (with no arguments).

The `mint` function accepts no arguments, and returns a token ID.

::: code-group

```ts [example.ts]
import { callContract } from 'viem'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
})
// 69420
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

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

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
import { callContract } from 'viem'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420]
})
// 69420
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

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Return Value

The response from the contract. Type is inferred.

## Parameters

### address

- **Type:** `Address`

The contract address.

```ts
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  abi: wagmiAbi,
  functionName: 'mint',
})
```

### abi

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi, // [!code focus]
  functionName: 'mint',
})
```

### functionName

- **Type:** `string`

A function to extract from the ABI.

```ts
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint', // [!code focus]
})
```

### accessList (optional)

- **Type:** [`AccessList`](/docs/glossary/types#TODO)

The access list.

```ts
const data = await callContract(publicClient, {
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
const data = await callContract(publicClient, {
  address: '0x1dfe7ca09e99d10835bf73044a23b73fc20623df',
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'] // [!code focus]
})
```

### from (optional)

- **Type:** `Address`

Optional sender override.

```ts
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' // [!code focus]
})
```

### gasPrice (optional)

- **Type:** `bigint`

The price (in wei) to pay per gas. Only applies to [Legacy Transactions](/docs/glossary/terms#TODO).

```ts
const data = await callContract(publicClient, {
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
const data = await callContract(publicClient, {
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
const data = await callContract(publicClient, {
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
const data = await callContract(publicClient, {
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
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  args: [69420],
  value: parseEther('1') // [!code focus]
})
```



### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const data = await callContract(publicClient, {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: wagmiAbi,
  functionName: 'mint',
  blockTag: 'safe', // [!code focus]
})
```