# Public Client [A function to create a Public Client]

A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).

The `createPublicClient` function sets up a Public Client with a given [Transport](/docs/clients/intro) configured for a [Chain](/docs/chains/introduction).

## Import

```ts twoslash
import { createPublicClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/docs/chains/introduction) (e.g. `mainnet`) and [Transport](/docs/clients/intro) (e.g. `http`).

```ts twoslash
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({ 
  chain: mainnet,
  transport: http()
})
```

Then you can consume [Public Actions](/docs/actions/public/introduction):

```ts twoslash
// [!include ~/snippets/publicClient.ts]
// ---cut---
const blockNumber = await publicClient.getBlockNumber() // [!code focus:10]
```

## Optimization

The Public Client also supports [`eth_call` Aggregation](#multicall) for improved performance.

### `eth_call` Aggregation (via Multicall)

The Public Client supports the aggregation of `eth_call` requests into a single multicall (`aggregate3`) request.

This means for every Action that utilizes an `eth_call` request (ie. `readContract`), the Public Client will batch the requests (over a timed period) and send it to the RPC Provider in a single multicall request. This can dramatically improve network performance, and decrease the amount of [Compute Units (CU)](https://docs.alchemy.com/reference/compute-units) used by RPC Providers like Alchemy, Infura, etc.

The Public Client schedules the aggregation of `eth_call` requests over a given time period. By default, it executes the batch request at the end of the current [JavaScript message queue](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#queue) (a [zero delay](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop#zero_delays)), however, consumers can specify a custom `wait` period (in ms).

You can enable `eth_call` aggregation by setting the `batch.multicall` flag to `true`:

```ts twoslash
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const publicClient = createPublicClient({
  batch: {
    multicall: true, // [!code focus]
  },
  chain: mainnet,
  transport: http(),
})
```

> You can also [customize the `multicall` options](#batchmulticallbatchsize-optional).

Now, when you start to utilize `readContract` Actions, the Public Client will batch and send over those requests at the end of the message queue (or custom time period) in a single `eth_call` multicall request:

:::code-group

```ts twoslash [example.ts]
// @filename: client.ts
// [!include ~/snippets/publicClient.ts]

// @filename: abi.ts
// [!include ~/snippets/erc20Abi.ts]

// @filename: example.ts
const address = '0x'
// ---cut---
import { getContract } from 'viem'
import { abi } from './abi'
import { publicClient } from './client'

const contract = getContract({ address, abi, client: publicClient })

// The below will send a single request to the RPC Provider.
const [name, totalSupply, symbol, balance] = await Promise.all([
  contract.read.name(),
  contract.read.totalSupply(),
  contract.read.symbol(),
  contract.read.balanceOf([address]),
])
```

```ts twoslash [client.ts]
// [!include ~/snippets/publicClient.ts]
```

```ts twoslash [abi.ts]
// [!include ~/snippets/erc20Abi.ts]
```

:::

> Read more on [Contract Instances](/docs/contract/getContract).

## Parameters

### transport

- **Type:** [Transport](/docs/glossary/types#transport)

The [Transport](/docs/clients/intro) of the Public Client.

```ts twoslash
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(), // [!code focus]
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

The [Chain](/docs/chains/introduction) of the Public Client.

```ts twoslash
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
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
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
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
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
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
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
  batch: {
    multicall: {
      wait: 16, // [!code focus]
    },
  },
  chain: mainnet,
  transport: http(),
})
```

### cacheTime (optional)

- **Type:** `number`
- **Default:** `client.pollingInterval`

Time (in ms) that cached data will remain in memory.

```ts twoslash
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
  cacheTime: 10_000, // [!code focus]
  chain: mainnet,
  transport: http(),
})
```

### ccipRead (optional)

- **Type:** `(parameters: CcipRequestParameters) => Promise<CcipRequestReturnType> | false`
- **Default:** `true`

[CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) configuration.

CCIP Read is enabled by default, but if set to `false`, the client will not support offchain CCIP lookups.

```ts twoslash
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
  ccipRead: false, // [!code focus]
  chain: mainnet,
  transport: http(),
})
```

### ccipRead.request (optional)

- **Type:** `(parameters: CcipRequestParameters) => Promise<CcipRequestReturnType>`

A function that will be called to make the [offchain CCIP lookup request](https://eips.ethereum.org/EIPS/eip-3668#client-lookup-protocol).

```ts twoslash
// @noErrors
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
  ccipRead: { // [!code focus]
    async request({ data, sender, urls }) { // [!code focus]
      // ... // [!code focus]
    } // [!code focus]
  }, // [!code focus]
  chain: mainnet,
  transport: http(),
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"public"`

A key for the Client.

```ts twoslash
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
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
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
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
// [!include ~/snippets/publicClient.ts:imports]
// ---cut---
const publicClient = createPublicClient({
  chain: mainnet,
  pollingInterval: 10_000, // [!code focus]
  transport: http(),
})
```

### rpcSchema (optional)

- **Type:** `RpcSchema`
- **Default:** `PublicRpcSchema`

Typed JSON-RPC schema for the client.

```ts twoslash
// [!include ~/snippets/publicClient.ts:imports]
// @noErrors
// ---cut---
import { rpcSchema } from 'viem'

type CustomRpcSchema = [{ // [!code focus]
  Method: 'eth_wagmi', // [!code focus]
  Parameters: [string] // [!code focus]
  ReturnType: string // [!code focus]
}] // [!code focus]

const publicClient = createPublicClient({
  chain: mainnet,
  rpcSchema: rpcSchema<CustomRpcSchema>(), // [!code focus]
  transport: http(),
})

const result = await publicClient.request({ // [!code focus]
  method: 'eth_wa // [!code focus] 
//               ^|
  params: ['hello'], // [!code focus]
}) // [!code focus]
```

## Live Example

Check out the usage of `createPublicClient` in the live [Public Client Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/clients_public-client) below.

<iframe frameBorder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/clients_public-client?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>
