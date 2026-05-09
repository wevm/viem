---
description: Gets the avatar of an ENS name.
---

# getEnsAvatar

Gets the avatar of an ENS name.

Calls [`getEnsText`](/docs/ens/actions/getEnsText) with `key` set to `'avatar'`.

## Usage

:::code-group

```ts [example.ts]
import { normalize } from 'viem/ens'
import { publicClient } from './client'
 
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'),
})
// 'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio'
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

:::warning
Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](/docs/ens/utilities/normalize) function for this.
:::

## Returns

`string | null`

The avatar URI for ENS name.

Returns `null` if the avatar cannot be resolved from the ENS name.

## Parameters

### name

- **Type:** `string`

ENS name to get Text for.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'), // [!code focus]
})
```

### assetGatewayUrls (optional)

- **Type:** `{ ipfs?: string; arweave?: string }`

Gateway urls to resolve IPFS and/or Arweave assets.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'),
  assetGatewayUrls: { // [!code focus:3]
    ipfs: 'https://cloudflare-ipfs.com'
  }
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'),
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'),
  blockTag: 'safe', // [!code focus]
})
```

### gatewayUrls (optional)

- **Type:** `string[]`

A set of Universal Resolver gateways, used for resolving CCIP-Read requests made through the ENS Universal Resolver Contract.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'), 
  gatewayUrls: ["https://ccip.ens.xyz"], // [!code focus]
})
```

### strict (optional)

- **Type:** `boolean`
- **Default:** `false`

A boolean value that when set to true will strictly propagate all ENS Universal Resolver Contract errors.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'), 
  strict: true, // [!code focus]
})
```

### universalResolverAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensText = await publicClient.getEnsAvatar({
  name: normalize('wevm.eth'),
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```