# Thirdweb Smart Account

:::warning
**Note:** This implementation is maintained & distributed by [permissionless.js](https://docs.pimlico.io/permissionless).
:::

To implement [Thirdweb Smart Account](https://portal.thirdweb.com/), you can use the [`toThirdwebSmartAccount`](https://github.com/pimlicolabs/permissionless.js/blob/main/packages/permissionless/accounts/thirdweb/toThirdwebSmartAccount.ts) module from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Install

:::code-group
```bash [pnpm]
pnpm add permissionless
```

```bash [npm]
npm install permissionless
```

```bash [yarn]
yarn add permissionless
```

```bash [bun]
bun add permissionless
```
:::

## Usage

:::code-group

```ts twoslash [example.ts]
import { toThirdwebSmartAccount } from 'permissionless/accounts' // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toThirdwebSmartAccount({ // [!code focus]
  client, // [!code focus]
  owner, // [!code focus]
}) // [!code focus]
```

```ts twoslash [client.ts] filename="config.ts"
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
 
export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

```ts twoslash [owner.ts (Private Key)] filename="owner.ts"
import { privateKeyToAccount } from 'viem/accounts'
 
export const owner = privateKeyToAccount('0x...')
```
:::

## Returns

`SmartAccount<ThirdwebSmartAccountImplementation>`

## Parameters

[See Parameters](https://github.com/pimlicolabs/permissionless.js/blob/d5bb008969c23183f02c16f86f71f051cceb8ee3/packages/permissionless/accounts/thirdweb/toThirdwebSmartAccount.ts#L46-L64)