---
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

While Account Abstraction is not built into the core `viem` library, you can use a third-party library like [permissionless.js](https://docs.pimlico.io/permissionless/reference) to integrate with ERC-4337.

**Libraries:**

- [permissionless.js](#permissionless-js)

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
