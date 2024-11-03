# Safe

To implement the [Safe Smart Wallet](https://github.com/safe-global/safe-smart-account), you can use [`toSafeSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toSimpleSmartAccount) from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Usage

:::code-group

```ts twoslash [example.ts]
import { toSafeSmartAccount } from "permissionless/accounts" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toSafeSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner], // [!code focus]
  version: "1.4.1", // [!code focus]
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

`SmartAccount<SafeSmartAccountImplementation>`

## Parameters

Checkout detailed parameters for `toSafeSmartAccount` at permissionless.js [documentation](https://docs.pimlico.io/permissionless/reference/accounts/toSafeSmartAccount#parameters)