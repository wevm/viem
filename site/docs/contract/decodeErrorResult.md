---
head:
  - - meta
    - property: og:title
      content: decodeErrorResult
  - - meta
    - name: description
      content: Decodes reverted error from a contract function call.
  - - meta
    - property: og:description
      content: Decodes reverted error from a contract function call.

---

# decodeErrorResult

Decodes reverted error from a contract function call.

## Install

```ts
import { decodeErrorResult } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { decodeErrorResult } from 'viem'

const value = decodeErrorResult({
  abi: wagmiAbi,
  data: '0xb758934b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000'
})
// { errorName: 'InvalidTokenError', args: ['sold out'] }
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

The decoded error.

## Parameters

### abi

- **Type:** [`Abi`](/docs/glossary/types#abi)

The contract's ABI.

```ts
const value = decodeErrorResult({
  abi: wagmiAbi, // [!code focus]
  data: '0xb758934b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000'
})
```

### data

- **Type:** [`Hex`](/docs/glossary/types#hex)

The calldata.

```ts
const value = decodeErrorResult({
  abi: wagmiAbi,
  data: '0xb758934b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000' // [!code focus]
})
```