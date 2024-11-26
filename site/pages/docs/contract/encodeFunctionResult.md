---
description: Encodes structured return data into ABI encoded data.
---

# encodeFunctionResult

Encodes structured return data into ABI encoded data. It is the opposite of [`decodeFunctionResult`](/docs/contract/decodeFunctionResult).

## Install

```ts
import { encodeFunctionResult } from 'viem';
```

## Usage

Given an ABI (`abi`) and a function (`functionName`), pass through the values (`values`) to encode:

:::code-group

```ts [example.ts]
import { encodeFunctionResult } from 'viem';
import { wagmiAbi } from './abi.ts'

const data = encodeFunctionResult({
  abi: wagmiAbi,
  functionName: 'ownerOf',
  value: ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
});
// '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac'
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  ...
] as const;
```

:::

### A more complex example

:::code-group

```ts [example.ts]
import { decodeFunctionResult } from 'viem'

const data = decodeFunctionResult({
  abi: wagmiAbi,
  functionName: 'getInfo',
  value: [
    {
      foo: {
        sender: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        x: 69420n,
        y: true
      },
      sender: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      z: 69
    }
  ]
})
// 0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000045
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [],
    name: 'getInfo',
    outputs: [
      {
        components: [
          {
            components: [
              {
                name: 'sender',
                type: 'address',
              },
              {
                name: 'x',
                type: 'uint256',
              },
              {
                name: 'y',
                type: 'bool',
              },
            ],
            name: 'foo',
            type: 'tuple',
          },
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'z',
            type: 'uint32',
          },
        ],
        name: 'res',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  ...
] as const;
```

:::

### Without `functionName`

If your `abi` contains only one ABI item, you can omit the `functionName` (it becomes optional):

```ts
import { encodeFunctionResult } from 'viem';

const abiItem = {
  inputs: [{ name: 'owner', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
}

const data = encodeFunctionResult({
  abi: wagmiAbi,
  functionName: 'ownerOf', // [!code --]
  value: ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
});
// '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac'
```

## Return Value

The decoded data. Type is inferred from the ABI.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const data = encodeFunctionResult({
  abi: wagmiAbi, // [!code focus]
  functionName: 'ownerOf',
  value: ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
});
```

### functionName

- **Type:** `string`

The function to encode from the ABI.

```ts
const data = encodeFunctionResult({
  abi: wagmiAbi,
  functionName: 'ownerOf', // [!code focus]
  value: ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'],
});
```

### values

- **Type**: [`Hex`](/docs/glossary/types#hex)

Return values to encode.

```ts
const data = encodeFunctionResult({
  abi: wagmiAbi,
  functionName: 'ownerOf',
  value: ['0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'], // [!code focus]
});
```
