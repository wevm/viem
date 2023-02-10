# getEnsAddress

Gets address for ENS name.

Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract to resolve the ENS name to address.

## Import

```ts
import { getEnsAddress } from 'viem'
```

## Usage

::: code-group

```ts [example.ts]
import { getEnsAddress } from 'viem'
import { publicClient } from './client'
 
const ensAddress = await getEnsAddress(publicClient, {
  name: 'wagmi-dev.eth',
})
// '0xd2135CfB216b74109775236E36d4b433F1DF507B'
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

`Address`

The address that resolves to provided ENS name.

Returns `0x0000000000000000000000000000000000000000` if ENS name does not resolve to address.

## Parameters

### address

- **Type:** `Address`

Address to get primary ENS name for.

```ts
const ensName = await getEnsAddress(publicClient, {
  name: 'wagmi-dev.eth', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensName = await getEnsAddress(publicClient, {
  name: 'wagmi-dev.eth',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensName = await getEnsAddress(publicClient, {
  name: 'wagmi-dev.eth',
  blockTag: 'safe', // [!code focus]
})
```

### universalResolverAddress (optional)

- **Type:** `Address`
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensName = await getEnsAddress(publicClient, {
  name: 'wagmi-dev.eth',
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```