---
description: Decodes ABI encoded data (4 byte selector & arguments) into a function name and arguments.
---

# decodeFunctionData

Decodes ABI encoded data (4 byte selector & arguments) into a function name and arguments.

The opposite of [`encodeFunctionData`](/docs/contract/encodeFunctionData).

## Install

```ts
import { decodeFunctionData } from 'viem'
```

## Usage

Below is a very basic example of how to decode a function to calldata.

:::code-group

```ts [example.ts]
import { decodeFunctionData } from 'viem'

const { functionName } = decodeFunctionData({
  abi: wagmiAbi,
  data: '0xc2985578'
})
// { functionName: 'totalSupply' }
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

### Extracting Arguments

If your calldata includes argument(s) after the 4byte function signature, you can extract them with the `args` return value.

:::code-group

```ts [example.ts]
import { decodeFunctionData } from 'viem'
import { wagmiAbi } from './abi'

// [!code word:args:1]
const { functionName, args } = decodeFunctionData({
  abi: wagmiAbi,
  data: '0x0423a1320000000000000000000000000000000000000000000000000000000000000001'
})
// { functionName: 'balanceOf', args: [1n] }
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

## Return Value

```ts
{
  functionName: string;
  args: unknown[] | undefined;
}
```

Decoded ABI function data.

### functionName

- **Type**: `string`

The decoded function name.

### args

- **Type**: `unknown[] | undefined`

The decoded function arguments.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const { functionName } = decodeFunctionData({
  abi: wagmiAbi, // [!code focus]
  data: '0xc2985578'
})
```

### data

- **Type:** [`Hex`](/docs/glossary/types#hex)

The encoded calldata.

```ts
const { functionName } = decodeFunctionData({
  abi: wagmiAbi,
  data: '0xc2985578' // [!code focus]
})
```
