---
description: Returns the address an account has delegated to via EIP-7702.
---

# getDelegation

Returns the address that an account has delegated to via [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702).

## Usage

:::code-group

```ts [example.ts]
import { publicClient } from './client'

const delegation = await publicClient.getDelegation({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
})
// '0x1234...5678' or undefined
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

[`Address`](/docs/glossary/types#address) | `undefined`

The address the account has delegated to, or `undefined` if the account is not delegated.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The address to check for delegation.

```ts
const delegation = await publicClient.getDelegation({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `bigint`

The block number to check the delegation at.

```ts
const delegation = await publicClient.getDelegation({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to check the delegation at.

```ts
const delegation = await publicClient.getDelegation({
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  blockTag: 'safe', // [!code focus]
})
```
