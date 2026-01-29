# Test Client [A function to create a Test Client]

A Test Client is an interface to "test" JSON-RPC API methods accessible through a local Ethereum test node such as [Anvil](https://book.getfoundry.sh/anvil/) or [Hardhat](https://hardhat.org/) such as mining blocks, impersonating accounts, setting fees, etc through [Test Actions](/docs/actions/test/introduction).

The `createTestClient` function sets up a Test RPC Client with a given [Transport](/docs/clients/intro).

## Import

```ts twoslash
import { createTestClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/docs/chains/introduction), [Transport](/docs/clients/intro) (e.g. `http`) and [mode](#mode) (e.g. `"anvil"`).

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
```

Then you can consume [Test Actions](/docs/actions/test/introduction):

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
// ---cut---
const mine = await client.mine({ blocks: 1 }) // [!code focus:10]
```

### Extending with Public & Wallet Actions

When interacting with a Ethereum test node, you may also find yourself wanting to interact with [Public Actions](/docs/actions/public/introduction) and [Wallet Actions](/docs/actions/wallet/introduction) with the same `chain` and `transport`. Instead of creating three different Clients, you can instead just extend the Test Client with those actions:

```ts twoslash
// @noErrors
import { createTestClient, http, publicActions, walletActions } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
  .extend(publicActions) // [!code hl]
  .extend(walletActions) // [!code hl]

const blockNumber = await client.getBlockNumber() // Public Action
const hash = await client.sendTransaction({ ... }) // Wallet Action
const mine = await client.mine({ blocks: 1 }) // Test Action
```

## Parameters

### mode

- **Type:** `"anvil" | "hardhat" | "ganache"`

Mode of the Test Client.

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', // [!code focus]
  transport: http(), 
})
```

### transport

- **Type:** [Transport](/docs/glossary/types#transport)

[Transport](/docs/clients/intro) of the Test Client.

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', 
  transport: http(),  // [!code focus]
})
```

### account (optional)

- **Type:** `Account | Address`

The Account to use for the Client. This will be used for Actions that require an `account` as an argument.

Accepts a [JSON-RPC Account](/docs/accounts/jsonRpc) or [Local Account (Private Key, etc)](/docs/accounts/local/privateKeyToAccount).

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
import { privateKeyToAccount } from 'viem/accounts'

const client = createTestClient({
  account: privateKeyToAccount('0x...'), // [!code focus]
  chain: foundry,
  mode: 'anvil',
  transport: http(),
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

[Chain](/docs/chains/introduction) of the Test Client.

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
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

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
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

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
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

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// ---cut---
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', 
  pollingInterval: 10_000,  // [!code focus]
  transport: http(),
})
```

### rpcSchema (optional)

- **Type:** `RpcSchema`
- **Default:** `TestRpcSchema`

Typed JSON-RPC schema for the client.

```ts twoslash
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'
// @noErrors
// ---cut---
import { rpcSchema } from 'viem'

type CustomRpcSchema = [{ // [!code focus]
  Method: 'eth_wagmi', // [!code focus]
  Parameters: [string] // [!code focus]
  ReturnType: string // [!code focus]
}] // [!code focus]

const client = createTestClient({
  chain: foundry,
  rpcSchema: rpcSchema<CustomRpcSchema>(), // [!code focus]
  transport: http()
})

const result = await client.request({ // [!code focus]
  method: 'eth_wa // [!code focus] 
//               ^|
  params: ['hello'], // [!code focus]
}) // [!code focus]
```
