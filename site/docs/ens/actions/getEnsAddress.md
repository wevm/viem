---
head:
  - - meta
    - property: og:title
      content: getEnsAddress
  - - meta
    - name: description
      content: Gets address for ENS name.
  - - meta
    - property: og:description
      content: Gets address for ENS name.

---

# getEnsAddress

Gets address for ENS name.

Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract to resolve the ENS name to address.

## Usage

::: code-group

```ts [example.ts]
import { normalize } from 'viem/ens'
import { publicClient } from './client'
 
const ensAddress = await publicClient.getEnsAddress({
  name: normalize('wagmi-dev.eth'),
})
// '0xd2135CfB216b74109775236E36d4b433F1DF507B'
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

::: warning
Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](/docs/ens/utilities/normalize) function for this.
:::

## Returns

[`Address`](/docs/glossary/types#address)

The address that resolves to provided ENS name.

Returns `null` if ENS name does not resolve to address.

## Parameters

### name

- **Type:** `string`

Name to get the address for.

```ts
const ensName = await publicClient.getEnsAddress({
  name: normalize('wagmi-dev.eth'), // [!code focus]
})
```

### blockNumber (optional)

- **Type:** `number`

The block number to perform the read against.

```ts
const ensName = await publicClient.getEnsAddress({
  name: normalize('wagmi-dev.eth'),
  blockNumber: 15121123n, // [!code focus]
})
```

### blockTag (optional)

- **Type:** `'latest' | 'earliest' | 'pending' | 'safe' | 'finalized'`
- **Default:** `'latest'`

The block tag to perform the read against.

```ts
const ensName = await publicClient.getEnsAddress({
  name: normalize('wagmi-dev.eth'),
  blockTag: 'safe', // [!code focus]
})
```

### coinType (optional)

- **Type:** `number`

The [ENSIP-9](https://docs.ens.domains/ens-improvement-proposals/ensip-9-multichain-address-resolution) coin type to fetch the address for

```ts
const ensName = await publicClient.getEnsAddress({
  name: normalize('wagmi-dev.eth'), 
  coinType: 60, // [!code focus]
})
```

### universalResolverAddress (optional)

- **Type:** [`Address`](/docs/glossary/types#address)
- **Default:** `client.chain.contracts.ensUniversalResolver.address`

Address of ENS Universal Resolver Contract.

```ts
const ensName = await publicClient.getEnsAddress({
  name: normalize('wagmi-dev.eth'),
  universalResolverAddress: '0x74E20Bd2A1fE0cdbe45b9A1d89cb7e0a45b36376', // [!code focus]
})
```

## Live Example

Check out the usage of `getEnsAddress` in the live [ENS Examples](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
