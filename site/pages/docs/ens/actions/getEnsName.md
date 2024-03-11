---
description: Gets primary name for specified address.
---

# getEnsName

Gets primary name for specified address.

Calls `reverse(bytes)` on ENS Universal Resolver Contract to "reverse resolve" the address to the primary ENS name.

## Usage

:::code-group

```ts [example.ts]
import { publicClient } from './client'
 
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
})
// 'wevm.eth'
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

## Returns

`string`

The primary ENS name for the address.

Returns `null` if address does not have primary name assigned.

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

Address to get primary ENS name for.

```ts
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  blockTag: 'safe', // [!code focus]
})
```

### gatewayUrls (optional)

- **Type:** `string[]`

A set of Universal Resolver gateways, used for resolving CCIP-Read requests made through the ENS Universal Resolver Contract.

```ts
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  gatewayUrls: ["https://ccip.ens.xyz"], // [!code focus]
})
```

### strict (optional)

- **Type:** `boolean`
- **Default:** `false`

A boolean value that when set to true will strictly propagate all ENS Universal Resolver Contract errors.

```ts
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  strict: true, // [!code focus]
})
```

### universalResolverAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensName = await publicClient.getEnsName({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```

## Live Example

Check out the usage of `getEnsName` in the live [ENS Examples](https://stackblitz.com/github/wevm/viem/tree/main/examples/ens) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wevm/viem/tree/main/examples/ens?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>