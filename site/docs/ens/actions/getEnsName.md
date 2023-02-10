# getEnsName

Gets primary name for specified address.

Calls `reverse(bytes)` on ENS Universal Resolver Contract to "reverse resolve" the address to the primary ENS name.

## Import

```ts
import { getEnsName } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { getEnsName } from 'viem'
import { publicClient } from './client'
 
const ensName = await getEnsName(publicClient, {
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
})
// 'wagmi-dev.eth'
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

- **Type:** `Address`

Address to get primary ENS name for.

```ts
const ensName = await getEnsName(publicClient, {
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensName = await getEnsName(publicClient, {
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensName = await getEnsName(publicClient, {
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  blockTag: 'safe', // [!code focus]
})
```

### universalResolverAddress (optional)

- **Type:** `Address`
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensName = await getEnsName(publicClient, {
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```