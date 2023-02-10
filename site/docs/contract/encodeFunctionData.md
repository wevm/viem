# encodeFunctionData

Encodes the function name and parameters into an ABI encoded value (4byte selector & arguments).

## Install

```ts
import { encodeFunctionData } from 'viem/contract'
```

## Usage

Below is a very basic example of how to encode a function to calldata.

::: code-group

```ts [example.ts]
import { encodeFunctionData } from 'viem/contract'

const data = encodeFunctionData({
  abi: wagmiAbi,
  functionName: 'totalSupply'
})
```

```ts
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
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

For example, the `balanceOf` function name below requires an **address** argument, and it is typed as `["0x${string}"]`.

::: code-group

```ts {8} [example.ts]
import { encodeFunctionData } from 'viem/contract'
import { publicClient } from './client'
import { wagmiAbi } from './abi'

const data = encodeFunctionData({
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
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

`Hex`

ABI encoded data (4byte function selector & arguments).

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#TODO)

The contract's ABI.

```ts
const data = encodeFunctionData({
  abi: wagmiAbi, // [!code focus]
  functionName: 'totalSupply',
})
```

### functionName

- **Type:** `string`

The function to encode from the ABI.

```ts
const data = encodeFunctionData({
  abi: wagmiAbi,
  functionName: 'totalSupply', // [!code focus]
})
```

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const data = encodeFunctionData({
  abi: wagmiAbi,
  functionName: 'balanceOf',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'] // [!code focus]
})
```