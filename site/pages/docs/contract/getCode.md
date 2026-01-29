---
description: Retrieves the bytecode at an address.
---

# getCode

Retrieves the bytecode at an address.

## Usage

:::code-group

```ts [example.ts]
import { publicClient } from './client'

const bytecode = await publicClient.getCode({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
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

The contract's bytecode.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The contract address.

```ts
const bytecode = await publicClient.getCode({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the bytecode read against.

```ts
const bytecode = await publicClient.getCode({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the bytecode read against.

```ts
const bytecode = await publicClient.getCode({
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  blockTag: 'safe', // [!code focus]
})
```

## JSON-RPC Method

[`eth_getCode`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode)
