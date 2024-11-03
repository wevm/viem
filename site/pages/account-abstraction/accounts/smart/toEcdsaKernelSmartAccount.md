# Kernel

To implement the [Kernel Smart Wallet](https://github.com/zerodevapp/kernel), you can use [`toEcdsaKernelSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toEcdsaKernelSmartAccount) from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Usage

:::code-group

```ts twoslash [example.ts]
import { toEcdsaKernelSmartAccount } from "permissionless/accounts" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toEcdsaKernelSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner], // [!code focus]
  version: "0.3.1", // [!code focus]
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

Checkout detailed parameters for `toEcdsaKernelSmartAccount` at permissionless.js [documentation](https://docs.pimlico.io/permissionless/reference/accounts/toEcdsaKernelSmartAccount#parameters)