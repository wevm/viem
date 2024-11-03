# Trust

To implement the [Trust Smart Wallet](https://developer.trustwallet.com/developer/barz-smart-wallet/build-with-trust-wallet-and-barz-aa-sdk), you can use [`toTrustSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toTrustSmartAccount) from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Usage

:::code-group

```ts twoslash [example.ts]
import { toTrustSmartAccount } from "permissionless/accounts" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toTrustSmartAccount({ // [!code focus]
  client, // [!code focus]
  owner: owner, // [!code focus]
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

`SmartAccount<TrustSmartAccountImplementation>`

## Parameters

Checkout detailed parameters for `toTrustSmartAccount` at permissionless.js [documentation](https://docs.pimlico.io/permissionless/reference/accounts/toTrustSmartAccount#parameters)