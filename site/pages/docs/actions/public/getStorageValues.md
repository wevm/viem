---
description: Returns storage values for multiple slots and multple addresses in one request.
---

# getStorageValues

Returns storage values for multiple slots and multiple addresses in one request.

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({ chain: mainnet, transport: http() })
const values = await client.getStorageValues({
  requests: {
    '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2': ['0x0', '0x1'],
  },
})
// @log: { '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2': ['0x...', '0x...'] }
```

## Returns

`Record<Address, Hex[]>`

Values are returned as 32-byte hex strings, in the same order as the requested slots for each address.

## Parameters

### requests

- **Type:** `Record<Address, readonly Hex[]>`

An object mapping each contract address to its requested storage slot keys. The total number of requested slots may be capped by the RPC provider.

### blockNumber (optional)

- **Type:** `bigint`

The block number at which to read storage. Defaults to the latest block.

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag at which to read storage.

### blockHash (optional)

- **Type:** `Hash`

The block hash at which to read storage.

### requireCanonical (optional)

- **Type:** `boolean`
- **Default:** `false`

Whether to require the block identified by `blockHash` to be canonical.

## JSON-RPC Method

[`eth_getStorageValues`](https://github.com/ethereum/execution-apis/issues/752)
