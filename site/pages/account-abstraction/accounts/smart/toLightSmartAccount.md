# Light

To implement the Alchemy's [Light Smart Wallet](https://github.com/alchemyplatform/light-account), you can use [`toLightSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toLightSmartAccount) from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Usage

:::code-group

```ts twoslash [example.ts]
import { toLightSmartAccount } from "permissionless/accounts" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toLightSmartAccount({ // [!code focus]
  client, // [!code focus]
  owner: owner, // [!code focus]
  version: "2.0.0" // [!code focus]
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

`SmartAccount<LightSmartAccountImplementation>`

## Parameters

Checkout detailed parameters for `toLightSmartAccount` at permissionless.js [documentation](https://docs.pimlico.io/permissionless/reference/accounts/toLightSmartAccount#parameters)