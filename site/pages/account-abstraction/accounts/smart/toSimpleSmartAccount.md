# Simple

To implement the [Simple Smart Wallet](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol), you can use [`toSimpleSmartAccount`](https://docs.pimlico.io/permissionless/reference/accounts/toSimpleSmartAccount) from [permissionless.js](https://docs.pimlico.io/permissionless/)

## Usage

:::code-group

```ts twoslash [example.ts]
import { toSimpleSmartAccount } from "permissionless/accounts" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toSimpleSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner], // [!code focus]
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

`SmartAccount<SimpleSmartAccountImplementation>`

## Parameters

Checkout detailed parameters for `toSimpleSmartAccount` at permissionless.js [documentation](https://docs.pimlico.io/permissionless/reference/accounts/toSimpleSmartAccount#parameters)