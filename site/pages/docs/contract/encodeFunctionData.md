---
description: Encodes the function name and parameters into an ABI encoded value (4 byte selector & arguments).
---

# encodeFunctionData

Encodes the function name and parameters into an ABI encoded value (4 byte selector & arguments).

## Install

```ts
import { encodeFunctionData } from 'viem'
```

## Usage

Below is a very basic example of how to encode a function to calldata.

:::code-group

```ts [example.ts]
import { encodeFunctionData } from 'viem'
import { wagmiAbi } from './abi.ts'

const data = encodeFunctionData({
  abi: wagmiAbi,
  functionName: 'totalSupply'
})
```

```ts [abi.ts]
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

:::

### Passing Arguments

If your function requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the function name & ABI, to guard you from inserting the wrong values.

For example, the `balanceOf` function name below requires an **address** argument, and it is typed as `["0x${string}"]`.

:::code-group

```ts [example.ts]
import { encodeFunctionData } from 'viem'
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

:::

### Without `functionName`

If your `abi` contains only one ABI item, you can omit the `functionName` (it becomes optional):

```ts
import { encodeFunctionData } from 'viem'

const abiItem = {
  inputs: [{ name: 'owner', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
}

const data = encodeFunctionData({
  abi: [abiItem],
  functionName: 'balanceOf', // [!code --]
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
```

### Preparation (Performance Optimization)

If you are calling the same function multiple times, you can prepare the function selector once and reuse it.

```ts
import { prepareEncodeFunctionData, encodeFunctionData } from 'viem'

const transfer = prepareEncodeFunctionData({
  abi: erc20Abi,
  functionName: 'transfer',
})

for (const address of addresses) {
  const data = encodeFunctionData({
    ...transfer,
    args: [address, 69420n],
  })
}
```

## Return Value

[`Hex`](/docs/glossary/types#hex)

ABI encoded data (4byte function selector & arguments).

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

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