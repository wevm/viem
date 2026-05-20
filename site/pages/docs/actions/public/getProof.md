---
description: Returns the account and storage values of the specified account including the Merkle-proof.
---

# getProof

Returns the account and storage values of the specified account including the Merkle-proof.

## Usage

:::code-group

```ts twoslash [example.ts]
import { publicClient } from './client'

const proof = await publicClient.getProof({ 
  address: '0x4200000000000000000000000000000000000016',
  storageKeys: [
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
})
```

```ts twoslash [client.ts] filename="client.ts"
import { createPublicClient, http } from 'viem'
import { optimism } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: optimism,
  transport: http()
})
```

:::

## Returns

`Proof`

Proof data.

## Parameters

### address

- **Type:** `bigint`

Account address.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const proof = await publicClient.getProof({
  address: '0x4200000000000000000000000000000000000016', // [!code focus]
  storageKeys: [
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
  blockNumber: 42069n
})
```

### storageKeys

- **Type:** `Hash[]`

Array of storage-keys that should be proofed and included.

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const proof = await publicClient.getProof({
  address: '0x4200000000000000000000000000000000000016',
  storageKeys: [ // [!code focus:3]
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
  blockNumber: 42069n
})
```

### blockNumber (optional)

- **Type:** `bigint`

Proof at a given block number.

```ts
const proof = await publicClient.getProof({
  address: '0x4200000000000000000000000000000000000016',
  storageKeys: [
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
  blockNumber: 42069n // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

Proof at a given block tag.

```ts
const proof = await publicClient.getProof({
  address: '0x4200000000000000000000000000000000000016',
  storageKeys: [
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
  blockTag: 'latest' // [!code focus]
})
```

### blockHash (optional)

- **Type:** `Hash`

Proof at a given block hash. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts
const proof = await publicClient.getProof({
  address: '0x4200000000000000000000000000000000000016',
  storageKeys: [
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d' // [!code focus]
})
```

### requireCanonical (optional)

- **Type:** `boolean`

Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts
const proof = await publicClient.getProof({
  address: '0x4200000000000000000000000000000000000016',
  storageKeys: [
    '0x4a932049252365b3eedbc5190e18949f2ec11f39d3bef2d259764799a1b27d99',
  ],
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
  requireCanonical: true // [!code focus]
})
```

## JSON-RPC Method

- Calls [`eth_getProof`](https://eips.ethereum.org/EIPS/eip-1186).
