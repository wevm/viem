# Account Abstraction [Integrate Account Abstraction (ERC-4337) into viem.]

While Account Abstraction is not built into the core `viem` library, you can use a third-party library like [permissionless.js](https://docs.pimlico.io/permissionless/reference) and [ZeroDev](https://docs.zerodev.app/) to integrate with ERC-4337.

**Libraries:**

- [permissionless.js](#permissionless-js)
- [ZeroDev](#zerodev)

## permissionless.js

[permissionless.js](https://docs.pimlico.io/permissionless/reference) is a TypeScript library built on viem for interacting with ERC-4337 bundlers, paymasters, and User Operations.

Below are instructions for setting up a Bundler Client.

### 1. Install

:::code-group

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

## ZeroDev

[ZeroDev](https://docs.zerodev.app/) is an SDK for building wallets and DApps using *modular smart accounts*.  The SDK uses Viem's client-action architecture to model smart accounts and their plugins.

Below are instructions for setting up a smart account client (which interacts with bundlers using a modular smart account).

### 1. Install

Install the core SDK and a plugin.

:::code-group

```bash [npm]
npm i @zerodev/sdk @zerodev/ecdsa-validator
```

```bash [pnpm]
pnpm i @zerodev/sdk @zerodev/ecdsa-validator
```

```bash [bun]
bun i @zerodev/sdk @zerodev/ecdsa-validator
```

:::

### 2. Create a public client

```ts
import { createPublicClient, http } from "viem"
 
const publicClient = createPublicClient({
  transport: http("RPC_URL"),  // use your RPC provider or bundler
})
```

### 3. Create a signer

This can be any Viem account type.  In this case we use a [Local Account](/docs/accounts/local).

```ts
import { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
 
const signer = privateKeyToAccount("PRIVATE_KEY" as Hex)  // replace with actual private key
```

### 4. Create a validator plugin

In this case, we are creating a smart account that uses ECDSA for validation (just like EOAs).

```ts
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
 
const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  signer,
})
```

### 5. Create a smart account

```ts
import { createKernelAccount } from "@zerodev/sdk"
 
const account = await createKernelAccount(publicClient, {
  plugins: {
    validator: ecdsaValidator,
  },
})
```

### 6. Create an account client

```ts
import { createKernelAccountClient } from "@zerodev/sdk"
import { http } from "viem"
import { polygonMumbai } from 'viem/chains'
 
const kernelClient = createKernelAccountClient({
  account,
  chain: polygonMumbai,
  transport: http('BUNDLER_RPC'),  // use your bundler RPC
  sponsorUserOperation,  // optional -- only if you want to use a paymaster
})
```

### 7. Send UserOps

Now you can send UserOps using the account client:

```ts
const txnHash = await kernelClient.sendTransaction({
  to: "TO_ADDRESS",
  value: VALUE,  // default to 0
  data: "0xDATA",  // default to 0x
})
```

You can also extend the account client with `bundlerActions` from Permissionless.js if you need to call any bundler RPCs:

```ts
import { bundlerActions } from "permissionless"
 
const bundlerClient = kernelClient.extend(bundlerActions)
const receipt = await bundlerClient.waitForUserOperationReceipt({
  hash: userOpHash,
})
```
