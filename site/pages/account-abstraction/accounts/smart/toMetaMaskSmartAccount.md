# MetaMask Smart Account

:::warning
**Note:** This implementation is maintained & distributed by [MetaMask Delegation Toolkit](https://docs.metamask.io/delegation-toolkit).
:::

MetaMask Smart Account has two types of implementations, each offering unique features 
and use cases. See [Hybrid Smart Account](https://docs.metamask.io/delegation-toolkit/how-to/create-smart-account/configure-accounts-signers/#configure-a-hybrid-smart-account) and [Multisig Smart Account](https://docs.metamask.io/delegation-toolkit/how-to/create-smart-account/configure-accounts-signers/#configure-a-multisig-smart-account) to learn more about 
the implementations.

To implement MetaMask Smart Account, you can use the [`toMetaMaskSmartAccount`](https://docs.metamask.io/delegation-toolkit/how-to/create-smart-account/#create-a-metamasksmartaccount) function from [delegation toolkit](https://docs.metamask.io/delegation-toolkit/).

## Install

:::code-group
```bash [pnpm]
pnpm add @metamask/delegation-toolkit
```

```bash [npm]
npm install @metamask/delegation-toolkit
```

```bash [yarn]
yarn add @metamask/delegation-toolkit
```

```bash [bun]
bun add @metamask/delegation-toolkit
```
:::

## Usage

:::code-group

```ts twoslash [example.ts]
import { // [!code focus]
  Implementation, // [!code focus]
  toMetaMaskSmartAccount, // [!code focus]
} from "@metamask/delegation-toolkit" // [!code focus]
import { client } from './client.js'
import { owner } from './owner.js'

const account = await toMetaMaskSmartAccount({ // [!code focus]
  client, // [!code focus]
  implementation: Implementation.Hybrid, // [!code focus]
  deployParams: [owner.address, [], [], []], // [!code focus]
  deploySalt: "0x", // [!code focus]
  signatory: { account: owner }, // [!code focus]
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

[See Parameters](https://docs.metamask.io/delegation-toolkit/reference/api/smart-account/#parameters-5)
