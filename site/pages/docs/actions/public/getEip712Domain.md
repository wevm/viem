---
description: Reads the EIP-712 domain from a contract.
---

# getEip712Domain

Reads the EIP-712 domain from a contract, based on the [ERC-5267 specification](https://eips.ethereum.org/EIPS/eip-5267).

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const { domain, extensions, fields } = await publicClient.getEip712Domain({ 
  address: '0x57ba3ec8df619d4d243ce439551cce713bb17411',
})
```

```ts [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::

## Returns

`GetEip712DomainReturnType`

The EIP-712 domain (`domain`) for the contract, with `fields` and `extensions`, as per [ERC-5267](https://eips.ethereum.org/EIPS/eip-5267).

## Parameters

### address

- **Type:** `string`

The address of the contract to read the EIP-712 domain from.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const result = await publicClient.getEip712Domain({ 
  address: '0x57ba3ec8df619d4d243ce439551cce713bb17411', // [!code focus]
})
```