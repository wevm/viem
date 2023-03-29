---
head:
  - - meta
    - property: og:title
      content: getEnsAvatar
  - - meta
    - name: description
      content: Gets avatar for specified name.
  - - meta
    - property: og:description
      content: Gets avatar for specified name.

---

# getEnsAvatar

Gets avatar for specified ENS.

Calls `text(bytes, string)` on ENS Universal Resolver Contract to find avatar text record.

## Usage

::: code-group

```ts [example.ts]
import { publicClient } from './client'
 
const ensAvatar = await publicClient.getEnsAvatar({
  name: 'wagmi-dev.eth',
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

::: warning
Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](/docs/ens/utilities/normalize) function for this.
:::

## Returns

`string`

The avatar for the ENS.

Returns `` if name does not have avatar assigned.

## Parameters

### name

- **Type:** string

ENS name to get avatar for.

```ts
const ensAvatar = await publicClient.getEnsAvatar({
  name: 'wagmi-dev.eth', // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensAvatar = await publicClient.getEnsAvatar({
  name: 'wagmi-dev.eth',
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensAvatar = await publicClient.getEnsAvatar({
  name: 'wagmi-dev.eth',
  blockTag: 'safe', // [!code focus]
})
```

### universalResolverAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensAvatar = await publicClient.getEnsAvatar({
  name: 'wagmi-dev.eth',
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```
