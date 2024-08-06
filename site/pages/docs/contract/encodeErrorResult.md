---
description: Encodes a reverted error from a function call.
---

# encodeErrorResult

Encodes a reverted error from a function call. The opposite of [`decodeErrorResult`](/docs/contract/decodeErrorResult).

## Install

```ts
import { encodeErrorResult } from 'viem'
```

## Usage

:::code-group

```ts [example.ts]
import { decodeErrorResult } from 'viem'
import { wagmiAbi } from './abi.ts'

const value = encodeErrorResult({
  abi: wagmiAbi,
  errorName: 'InvalidTokenError',
  args: ['sold out']
})
// 0xb758934b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000
```

```ts [abi.ts]
export const wagmiAbi = [
  ...
  {
		inputs: [
			{
				name: "reason",
				type: "string"
			}
		],
		name: "InvalidTokenError",
		type: "error"
	},
  ...
] as const;
```

:::

### Without `errorName`

If your `abi` contains only one ABI item, you can omit the `errorName` (it becomes optional):

```ts
import { decodeErrorResult } from 'viem'

const abiItem = {
  inputs: [{ name: 'reason', type: 'string' }],
  name: 'InvalidTokenError',
  type: 'error'
}

const value = encodeErrorResult({
  abi: [abiItem],
  errorName: 'InvalidTokenError', // [!code --]
  args: ['sold out']
})
// 0xb758934b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000
```

## Return Value

[`Hex`](/docs/glossary/types#hex)

The encoded error.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const value = decodeErrorResult({
  abi: wagmiAbi, // [!code focus]
  errorName: 'InvalidTokenError',
  args: ['sold out']
})
```

### errorName

- **Type:** `string`

The error name on the ABI.

```ts
const value = encodeErrorResult({
  abi: wagmiAbi,
  errorName: 'InvalidTokenError', // [!code focus]
  args: ['sold out']
})
```

### args (optional)

- **Type:** Inferred.

Arguments (if required) to pass to the error.

```ts
const value = encodeErrorResult({
  abi: wagmiAbi,
  errorName: 'InvalidTokenError',
  args: ['sold out'] // [!code focus]
})
```