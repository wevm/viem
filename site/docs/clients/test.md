---
head:
  - - meta
    - property: og:title
      content: Test Client
  - - meta
    - name: description
      content: A function to create a Test Client.
  - - meta
    - property: og:description
      content: A function to create a Test Client.

---

# Test Client

A Test Client is an interface to "test" JSON-RPC API methods accessible through a local Ethereum test node such as [Anvil](https://book.getfoundry.sh/anvil/) or [Hardhat](https://hardhat.org/) such as mining blocks, impersonating accounts, setting fees, etc through [Test Actions](/docs/actions/test/introduction).

The `createTestClient` function sets up a Test RPC Client with a given [Transport](/docs/clients/intro).

## Import

```ts
import { createTestClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/docs/clients/chains), [Transport](/docs/clients/intro) (e.g. `http`) and [mode](#mode) (e.g. `"anvil"`).

```ts
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
```

Then you can consume [Test Actions](/docs/actions/test/introduction):

```ts
const mine = await client.mine({ blocks: 1 }) // [!code focus:10]
```

### Extending with Public & Wallet Actions

When interacting with a Ethereum test node, you may also find yourself wanting to interact with [Public Actions](/docs/actions/public/introduction) and [Wallet Actions](/docs/actions/wallet/introduction) with the same `chain` and `transport`. Instead of creating three different Clients, you can instead just extend the Test Client with those actions:

```ts
import { createTestClient, http, publicActions, walletActions } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
  .extend(publicActions)
  .extend(walletActions)

const blockNumber = await client.getBlockNumber() // Public Action
const hash = await client.sendTransaction({ ... }) // Wallet Action
const mine = await client.mine({ blocks: 1 }) // Test Action
```

## Parameters

### mode

- **Type:** `"anvil" | "hardhat" | "ganache"`

Mode of the Test Client.

```ts
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', // [!code focus]
  transport: http(), 
})
```

### transport

- **Type:** [Transport](/docs/glossary/types#transport)

[Transport](/docs/clients/intro) of the Test Client.

```ts
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', 
  transport: http(),  // [!code focus]
})
```

### account (optional)

- **Type:** `Account | Address`

The Account to use for the Client. This will be used for Actions that require an `account` as an argument.

Accepts a [JSON-RPC Account](/docs/accounts/jsonRpc) or [Local Account (Private Key, etc)](/docs/accounts/privateKey).

```ts
import { privateKeyToAccount } from 'viem/accounts'

const client = createTestClient({
  account: privateKeyToAccount('0x...') // [!code focus]
  chain: foundry,
  mode: 'anvil',
  transport: http(),
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

[Chain](/docs/clients/chains) of the Test Client.

```ts
const client = createTestClient({
  chain: foundry, // [!code focus]
  mode: 'anvil',
  transport: http(), 
})
```

### cacheTime (optional)

- **Type:** `number`
- **Default:** `client.pollingInterval`

Time (in ms) that cached data will remain in memory.

```ts
const client = createTestClient({
  cacheTime: 10_000, // [!code focus]
  chain: foundry,
  mode: 'anvil',
  transport: http(),
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Test Client"`

A name for the Client.

```ts
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', 
  name: 'Anvil Client',  // [!code focus]
  transport: http(),
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', 
  pollingInterval: 10_000,  // [!code focus]
  transport: http(),
})
```
