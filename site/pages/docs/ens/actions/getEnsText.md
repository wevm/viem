---
description: Gets a text record for specified ENS name.
---

# getEnsText

Gets a text record for specified ENS name.

Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.

## Usage

:::code-group

```ts [example.ts]
import { normalize } from 'viem/ens'
import { publicClient } from './client'
 
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter',
})
// 'wevm_dev'
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
Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsText`. You can use the built-in [`normalize`](/docs/ens/utilities/normalize) function for this.
:::

## Returns

`string | null`

The text record for ENS name.

Returns `null` if name does not have text assigned.

## Parameters

### name

- **Type:** `string`

ENS name to get Text for.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'), // [!code focus]
  key: 'com.twitter',
})
```

### key

- **Type:** `string`

ENS key to get Text for.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter',
  blockTag: 'safe', // [!code focus]
})
```

### gatewayUrls (optional)

- **Type:** `string[]`

A set of Universal Resolver gateways, used for resolving CCIP-Read requests made through the ENS Universal Resolver Contract.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter',
  gatewayUrls: ["https://ccip.ens.xyz"], // [!code focus]
})
```

### strict (optional)

- **Type:** `boolean`
- **Default:** `false`

A boolean value that when set to true will strictly propagate all ENS Universal Resolver Contract errors.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter',
  strict: true, // [!code focus]
})
```


### universalResolverAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensText = await publicClient.getEnsText({
  name: normalize('wevm.eth'),
  key: 'com.twitter',
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```
