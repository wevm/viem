---
description: Filters chain definitions by structured criteria.
---

# filterChains

Filters chain definitions by structured criteria, such as token support or testnet status.

:::warning
This utility is experimental and may change in a future release.
:::

## Import

```ts
import { filterChains } from 'viem/utils'
```

## Usage

```ts
import * as chains from 'viem/chains'
import { usdc } from 'viem/tokens'
import { filterChains } from 'viem/utils'

const supportedChains = filterChains({
  chains,
  token: usdc,
  testnet: true,
  sort: 'name',
})

supportedChains[0]?.id
//                 ^? (property) id: 300 | 338 | 998 | 1301 | ...
```

The `token` criterion narrows the returned chain IDs to chains where the token has a configured address. This keeps token symbols type-safe when you pass a filtered chain into a client.

```ts
import { createClient, http, publicActions } from 'viem'
import * as chains from 'viem/chains'
import { usdc } from 'viem/tokens'
import { filterChains } from 'viem/utils'

const [chain] = filterChains({
  chains,
  token: usdc,
  testnet: true,
})

if (chain) {
  const client = createClient({
    chain,
    tokens: [usdc],
    transport: http(),
  }).extend(publicActions)

  await client.token.getBalance({ token: 'usdc' })
}
```

:::warning
Importing all chains from `viem/chains` significantly increases bundle size. This pattern is recommended for scripts, server-side code, or other environments where bundle size is not a concern.
:::

## Returns

- **Type:** `Chain[]` (inferred)

The filtered chains.

When `token` is provided, each returned chain's `id` is narrowed to the token's supported chain IDs.

When `testnet: true` is provided, each returned chain's `testnet` property is narrowed to `true`.

## Parameters

### chains

- **Type:** `Record<string, unknown> | readonly unknown[]`

A chain registry or array. You can pass `import * as chains from 'viem/chains'` or an array of chain definitions.

```ts
import { mainnet, optimism, sepolia } from 'viem/chains'
import { filterChains } from 'viem/utils'

const testnets = filterChains({
  chains: [mainnet, optimism, sepolia],
  testnet: true,
})
```

### token

- **Type:** `Token`

Only include chains with an address for the token.

```ts
import * as chains from 'viem/chains'
import { usdc } from 'viem/tokens'
import { filterChains } from 'viem/utils'

const usdcChains = filterChains({
  chains,
  token: usdc,
})
```

### testnet

- **Type:** `boolean`

Only include testnets when `true`, or mainnets when `false`.

```ts
import * as chains from 'viem/chains'
import { filterChains } from 'viem/utils'

const testnets = filterChains({
  chains,
  testnet: true,
})
```

### sort

- **Type:** `'id' | 'name'`

Sort the matching chains by chain ID or name.

```ts
import * as chains from 'viem/chains'
import { filterChains } from 'viem/utils'

const sortedChains = filterChains({
  chains,
  sort: 'name',
})
```
