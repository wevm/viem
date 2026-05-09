# Build your own Client

You can build your own viem Client by using the `createClient` function and optionally extending (`.extend`) it – this is how viem's internal Clients ([Public](/docs/clients/public), [Wallet](/docs/clients/wallet), and [Test](/docs/clients/test)) are built.

Building your own Client is useful if you have specific requirements for how the Client should behave, and if you want to extend that Client with custom functionality (ie. create a [geth Debug](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-debug) Client).

The `createClient` function sets up a base viem Client with a given [Transport](/docs/clients/intro) configured with a [Chain](/docs/chains/introduction). After that, you can extend the Client with custom properties (that could be Actions or other configuration).

## Import

```ts twoslash
import { createClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/docs/chains/introduction) (e.g. `mainnet`) and [Transport](/docs/clients/intro) (e.g. `http`).

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createClient({ 
  chain: mainnet,
  transport: http()
})
```

Next, you can either [extend your Client with Actions or configuration](#extending-with-actions-or-configuration), or you can use it as-is for the purpose of [maximizing tree-shaking in your app](#tree-shaking).

### Extending with Actions or configuration

You can extend your Client with custom Actions or configuration by using the `.extend` function.

Below is a naive implementation of implementing a [geth Debug](https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-debug) Client with a `traceCall` Action that uses the `debug_traceCall` RPC method.

```ts twoslash {12-21,23-29}
// @noErrors
import { 
  createClient, 
  http,
  formatTransactionRequest,
  type CallParameters
} from 'viem'
import { mainnet } from 'viem/chains'

const debugClient = createClient({ 
  chain: mainnet,
  transport: http(),
}).extend(client => ({
  // ...
  async traceCall(args: CallParameters) {
    return client.request({
      method: 'debug_traceCall',
      params: [formatTransactionRequest(args), 'latest', {}]
    })
  },
  // ...
}))

const response = await debugClient.traceCall({
  account: '0xdeadbeef29292929192939494959594933929292',
  to: '0xde929f939d939d393f939393f93939f393929023',
  gas: 69420n,
  data: '0xf00d4b5d00000000000000000000000001291230982139282304923482304912923823920000000000000000000000001293123098123928310239129839291010293810'
})
// { failed: false, gas: 69420, returnValue: '...', structLogs: [] }
```

For a more succinct implementation of using `.extend`, check out viem's [Public Client implementation](https://github.com/wagmi-dev/viem/blob/29c053f5069a5b44e3791972c221368a2c71a254/src/clients/createPublicClient.ts#L48-L68) extended with [Public Actions](https://github.com/wagmi-dev/viem/blob/29c053f5069a5b44e3791972c221368a2c71a254/src/clients/decorators/public.ts#L1377-L1425).

### Tree-shaking

You can use the Client as-is, with no decorated Actions, to maximize tree-shaking in your app. This is useful if you are pedantic about bundle size and want to only include the Actions you use.

In the example below, instead of calling `getBlock` from the Public Client, we are importing the Action directly from `viem` and then injecting our Client as the first parameter to the Action.

```ts twoslash {3,10-11}
// @noErrors
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { getBlock, sendTransaction } from 'viem/actions'

const client = createClient({ 
  chain: mainnet,
  transport: http()
})

const blockNumber = await getBlock(client, { blockTag: 'latest' })
const hash = await sendTransaction(client, { ... })
```

## Parameters

### transport

- **Type:** [Transport](/docs/glossary/types#transport)

The [Transport](/docs/clients/intro) of the Public Client.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  chain: mainnet,
  transport: http(), // [!code focus]
})
```

### account (optional)

- **Type:** `Account | Address`

The Account to use for the Client. This will be used for Actions that require an `account` as an argument.

Accepts a [JSON-RPC Account](/docs/accounts/jsonRpc) or [Local Account (Private Key, etc)](/docs/accounts/local/privateKeyToAccount).

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
import { privateKeyToAccount } from 'viem/accounts'

const client = createClient({
  account: privateKeyToAccount('0x...'), // [!code focus]
  chain: mainnet,
  transport: http(),
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

The [Chain](/docs/chains/introduction) of the Public Client.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  chain: mainnet, // [!code focus]
  transport: http(),
})
```

### batch (optional)

Flags for batch settings.

### batch.multicall (optional)

- **Type:** `boolean | MulticallBatchOptions`
- **Default:** `false`

Toggle to enable `eth_call` multicall aggregation.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  batch: {
    multicall: true, // [!code focus]
  },
  chain: mainnet,
  transport: http(),
})
```

### batch.multicall.batchSize (optional)

- **Type:** `number`
- **Default:** `1_024`

The maximum size (in bytes) for each multicall (`aggregate3`) calldata chunk.

> Note: Some RPC Providers limit the amount of calldata that can be sent in a single request. It is best to check with your RPC Provider to see if there are any calldata size limits to `eth_call` requests.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  batch: {
    multicall: {
      batchSize: 512, // [!code focus]
    },
  },
  chain: mainnet,
  transport: http(),
})
```

### batch.multicall.wait (optional)

- **Type:** `number`
- **Default:** `0` ([zero delay](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#zero_delays))

The maximum number of milliseconds to wait before sending a batch.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  batch: {
    multicall: {
      wait: 16, // [!code focus]
    },
  },
  chain: mainnet,
  transport: http(),
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"public"`

A key for the Client.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  chain: mainnet,
  key: 'public', // [!code focus]
  transport: http(),
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Public Client"`

A name for the Client.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  chain: mainnet,
  name: 'Public Client', // [!code focus]
  transport: http(),
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createClient({
  chain: mainnet,
  pollingInterval: 10_000, // [!code focus]
  transport: http(),
})
```

### rpcSchema (optional)

- **Type:** `RpcSchema`
- **Default:** `WalletRpcSchema`

Typed JSON-RPC schema for the client.

```ts twoslash
import { createClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// @noErrors
// ---cut---
import { rpcSchema } from 'viem'

type CustomRpcSchema = [{ // [!code focus]
  Method: 'eth_wagmi', // [!code focus]
  Parameters: [string] // [!code focus]
  ReturnType: string // [!code focus]
}] // [!code focus]

const client = createClient({
  chain: mainnet,
  rpcSchema: rpcSchema<CustomRpcSchema>(), // [!code focus]
  transport: http()
})

const result = await client.request({ // [!code focus]
  method: 'eth_wa // [!code focus] 
//               ^|
  params: ['hello'], // [!code focus]
}) // [!code focus]
```