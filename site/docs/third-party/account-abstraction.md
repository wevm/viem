---
outline: deep
head:
  - - meta
    - property: og:title
      content: Account Abstraction
  - - meta
    - name: description
      content: Integrate Account Abstraction (ERC-4337) into viem.
  - - meta
    - property: og:description
      content: Integrate Account Abstraction (ERC-4337) into viem.
---

# Account Abstraction

While Account Abstraction is not built into the core `viem` library, you can use a third-party library like [Account Kit](https://accountkit.alchemy.com) and [permissionless.js](https://docs.pimlico.io/permissionless/reference) to integrate with ERC-4337.

**Libraries:**
- [account-kit](#account-kit)
- [permissionless.js](#permissionless-js)


## Account Kit

**Account Kit** is a framework to embed smart accounts in your web3 app, unlocking [powerful features](https://accountkit.alchemy.com/getting-started) like email/social login, gas sponsorship, batched transactions, and more. The [`aa-sdk`](https://github.com/alchemyplatform/aa-sdk) makes it easy to integrate and deploy smart accounts, send user operations, and sponsor gas with just a few lines of code.

### What is included in the Account Kit stack?

Account Kit is a complete solution for [account abstraction](https://www.alchemy.com/overviews/what-is-account-abstraction). It includes five components:

- **AA-SDK**: A simple, powerful interface to integrate, deploy, and use smart accounts. The [`aa-sdk`](https://github.com/alchemyplatform/aa-sdk) orchestrates everything under the hood to make development easy.
- **LightAccount:** Secure, audited smart contract accounts. Easy to deploy, just when your users need them.
- **Signer:** Integrations with the most popular wallet providers. Secure your accounts with email, social login, passkeys, or a self-custodial wallet signer.
- **Gas Manager API:** A programmable API to sponsor gas for UserOps that meet your criteria.
- **Bundler API:** The most reliable ERC-4337 Bundler. Land your UserOps onchain, batch operations, and sponsor gas at massive scale.

### Getting Started

Below is a quick example that will show you how to create a Provider, connect it to a Light Account which will be owned by an EOA private key, and send a User Operation with that account.

#### 1. Install the aa-sdk

::: code-group

```bash [npm]
npm install @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

```bash [yarn]
yarn add @alchemy/aa-alchemy @alchemy/aa-accounts @alchemy/aa-core viem
```

:::

#### 2. Create a Provider and Connect to Light Account

```ts
// importing required dependencies
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactory,
} from "@alchemy/aa-accounts";
import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const chain = sepolia;
const PRIVATE_KEY = "0xYourEOAPrivateKey"; // Replace with the private key of your EOA that will be the owner of Light Account

const eoaSigner: SmartAccountSigner =
  LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY); // Create a signer for your EOA

// Create a provider with your EOA as the smart account owner, this provider is used to send user operations from your smart account and interact with the blockchain
const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // Replace with your Alchemy API key, you can get one at https://dashboard.alchemy.com/
  chain,
  entryPointAddress: "0x...",
}).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: "0x...",
      chain: rpcClient.chain,
      owner: eoaSigner,
      factoryAddress: getDefaultLightAccountFactory(rpcClient.chain), // Default address for Light Account on Sepolia, you can replace it with your own.
      rpcClient,
    })
); // Log the user operation hash


// Logging the smart account address -- please fund this address with some SepoliaETH in order for the user operations to be executed successfully
provider.getAddress().then((address: string) => console.log(address));

```

::: tip Note
Remember to:

1. Replace `"0xYourEOAPrivateKey"` with your actual EOA private key.
2. Set `"ALCHEMY_API_KEY"` with your unique Alchemy API key.
3. Fund your smart account address with some SepoliaETH in order for the user operation to go through. This address is logged to the console when you run the script.
4. Adjust the `target` and `data` fields in the `sendUserOperation` function to match your requirements.
:::

#### 3. Send a User Operation

```ts
// provider from previous steps

// Send a user operation from your smart contract account
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress", // Replace with the desired target address
  data: "0xCallData", // Replace with the desired call data
  value: 0n, // value: bigint or undefined
});

console.log(hash);
```

### Next Steps
For a more, in depth, guide on how to build your own 4337 dApp, check out our [guide](https://accountkit.alchemy.com/smart-accounts/overview.html). The guide will take you through all the steps necessary to Deploy an Account, Select a Signer, Sponsor Gas, Send Transactions (including batched transactions), and Managing Account Ownership.

## permissionless.js

[permissionless.js](https://docs.pimlico.io/permissionless/reference) is a TypeScript library built on viem for interacting with ERC-4337 bundlers, paymasters, and User Operations.

Below are instructions for setting up a Bundler Client.

### 1. Install

::: code-group

```bash [npm]
npm i permissionless
```

```bash [pnpm]
pnpm i permissionless
```

```bash [bun]
bun i permissionless
```

:::

### 2. Set up a Bundler Client

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { bundlerActions } from 'permissionless'
 
const bundlerClient = createClient({ 
  chain: mainnet,
  transport: http("https://api.pimlico.io/v1/goerli/rpc?apikey=YOUR_API_KEY_HERE")
}).extend(bundlerActions)
```

### 3. Consume Actions

Now you can consume Actions that are supported by [permissionless.js](https://docs.pimlico.io/permissionless/reference/bundler-actions/supportedEntryPoints).

[See a full list of Bundler Actions.](https://docs.pimlico.io/permissionless/reference/bundler-actions/sendUserOperation)

```ts
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { bundlerActions } from 'permissionless'
 
const bundlerClient = createClient({ 
  chain: mainnet,
  transport: http("https://api.pimlico.io/v1/goerli/rpc?apikey=YOUR_API_KEY_HERE")
}).extend(bundlerActions)

const supportedEntryPoints = await bundlerClient.supportedEntryPoints() // [!code focus]
```
