# Nexus

To implement the Biconomy's [Nexus Smart Wallet](https://github.com/bcnmy/nexus), you can use [`toNexusSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toNexusSmartAccount) from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Usage

:::code-group

```ts twoslash [example.ts]
import { toNexusSmartAccount } from "permissionless/accounts" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toNexusSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner], // [!code focus]
  version: "1.0.0" // [!code focus]
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

`SmartAccount<NexusSmartAccountImplementation>`

## Parameters

Checkout detailed parameters for `toNexusSmartAccount` at permissionless.js [documentation](https://docs.pimlico.io/permissionless/reference/accounts/toNexusSmartAccount#parameters)