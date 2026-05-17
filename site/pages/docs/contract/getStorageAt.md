---
description: Returns the value from a storage slot at a given address.
---

# getStorageAt

Returns the value from a storage slot at a given address.

## Usage

:::code-group

```ts [example.ts]
import { toHex } from 'viem'
import { wagmiAbi } from './abi'
import { publicClient } from './client'

const data = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0)
})
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

[`Hex`](/docs/glossary/types#hex)

The value of the storage slot.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const data = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  slot: toHex(0)
})
```

### slot

- **Type**: [`Hex`](/docs/glossary/types#hex)

The storage position (as a hex encoded value).

```ts
const data = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0) // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the storage slot read against.

```ts
const bytecode = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0),
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the storage slot read against.

```ts
const bytecode = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0),
  blockTag: 'safe', // [!code focus]
})
```

### blockHash (optional)

- **Type:** `Hash`

The block hash to perform the storage slot read against. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts
const bytecode = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0),
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d', // [!code focus]
})
```

### requireCanonical (optional)

- **Type:** `boolean`

Whether or not to throw an error if the block is not in the canonical chain. Only allowed in conjunction with `blockHash`. Implements [EIP-1898](https://eips.ethereum.org/EIPS/eip-1898).

```ts
const bytecode = await publicClient.getStorageAt({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  slot: toHex(0),
  blockHash: '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
  requireCanonical: true, // [!code focus]
})
```

## JSON-RPC Method

[`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat)