# Kernel (ZeroDev) Smart Account

:::warning
**Note:** This implementation is maintained & distributed by [permissionless.js](https://docs.pimlico.io/permissionless).
:::

To implement the [Kernel (ZeroDev) Smart Account](https://github.com/zerodevapp/kernel), you can use the [`toEcdsaKernelSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toEcdsaKernelSmartAccount) module from [permissionless.js](https://docs.pimlico.io/permissionless/)

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
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts' // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toEcdsaKernelSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner], // [!code focus]
  version: '0.3.1', // [!code focus]
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

`SmartAccount<EcdsaKernelSmartAccountImplementation>`

## Parameters

[See Parameters](https://docs.pimlico.io/permissionless/reference/accounts/toEcdsaKernelSmartAccount#parameters)
