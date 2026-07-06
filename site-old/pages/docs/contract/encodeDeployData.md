---
description: Encodes deploy data (bytecode & constructor args) into an ABI encoded value.
---

# encodeDeployData

Encodes deploy data (bytecode & constructor args) into an ABI encoded value.

## Install

```ts
import { encodeDeployData } from 'viem'
```

## Usage

Below is a very basic example of how to encode deploy data.

:::code-group

```ts [example.ts]
import { encodeDeployData } from 'viem'
import { wagmiAbi } from './abi.ts'

const data = encodeDeployData({
  abi: wagmiAbi,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...'
})
// 0x608060405260405161083e38038061083e833981016040819052610...
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  { 
    inputs: [], 
    stateMutability: 'nonpayable', 
    type: 'constructor' 
  },
  ...
] as const;
```

:::

### Passing Arguments

If your constructor requires argument(s), you can pass them through with the `args` attribute.

TypeScript types for `args` will be inferred from the constructor & ABI, to guard you from inserting the wrong values.

For example, the `constructor` below requires an **address** argument, and it is typed as `["0x${string}"]`.

:::code-group

```ts [example.ts]
import { encodeDeployData } from 'viem'
import { wagmiAbi } from './abi'

const data = encodeDeployData({
  abi: wagmiAbi,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
// 0x608060405260405161083e38038061083e833981016040819052610...00000000000000000000000000000000a5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
    inputs: [{ name: 'owner', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  ...
] as const;
```

:::

## Return Value

[`Hex`](/docs/glossary/types#hex)

ABI encoded data (bytecode & constructor arguments).

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const data = encodeDeployData({
  abi: wagmiAbi, // [!code focus]
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
```

### bytecode

- **Type:** [`Hex`](/docs/glossary/types#hex)

Contract bytecode.

```ts
const data = encodeDeployData({
  abi: wagmiAbi,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...', // [!code focus]
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC']
})
```

### args (optional)

- **Type:** Inferred from ABI.

Arguments to pass to function call.

```ts
const data = encodeDeployData({
  abi: wagmiAbi,
  bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
  args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'] // [!code focus]
})
```
