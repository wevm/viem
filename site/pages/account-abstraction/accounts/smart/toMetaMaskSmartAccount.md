# MetaMask Smart Account

:::warning
**Note:** This implementation is maintained & distributed by [MetaMask Smart Accounts Kit](https://docs.metamask.io/smart-accounts-kit).
:::

MetaMask Smart Accounts has three types of implementations, each offering unique features 
and use cases. See [Hybrid smart account](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/#create-a-hybrid-smart-account), [Multisig smart account](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/#create-a-multisig-smart-account), and [Stateless 7702 smart account](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/#create-a-stateless-7702-smart-account) to learn more about 
the implementations.

To implement MetaMask Smart Accounts, you can use the [`toMetaMaskSmartAccount`](https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/) function from the [Smart Accounts Kit](https://docs.metamask.io/smart-accounts-kit/).

## Install

:::code-group
```bash [pnpm]
pnpm add @metamask/smart-accounts-kit
```

```bash [npm]
npm install @metamask/smart-accounts-kit
```

```bash [yarn]
yarn add @metamask/smart-accounts-kit
```

```bash [bun]
bun add @metamask/smart-accounts-kit
```
:::

## Usage

:::code-group

```ts twoslash [example.ts]
import { // [!code focus]
  Implementation, // [!code focus]
  toMetaMaskSmartAccount, // [!code focus]
} from "@metamask/smart-accounts-kit" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toMetaMaskSmartAccount({ // [!code focus]
  client, // [!code focus]
  implementation: Implementation.Hybrid, // [!code focus]
  deployParams: [owner.address, [], [], []], // [!code focus]
  deploySalt: "0x", // [!code focus]
  signer: { account: owner }, // [!code focus]
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

`SmartAccount<MetaMaskSmartAccountImplementation<TImplementation>>`

## Parameters

[See Parameters](https://docs.metamask.io/smart-accounts-kit/reference/smart-account/#parameters-6)
