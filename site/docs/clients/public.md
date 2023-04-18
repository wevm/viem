---
head:
  - - meta
    - property: og:title
      content: Public Client
  - - meta
    - name: description
      content: A function to create a Public Client.
  - - meta
    - property: og:description
      content: A function to create a Public Client.

---

# Public Client

A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).

The `createPublicClient` function sets up a Public Client with a given [Transport](/docs/clients/intro) configured for a [Chain](/docs/clients/chains).

## Import

```ts
import { createPublicClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/docs/clients/chains) (e.g. `mainnet`) and [Transport](/docs/clients/intro) (e.g. `http`).

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({ 
  chain: mainnet,
  transport: http()
})
```

Then you can consume [Public Actions](/docs/actions/public/introduction):

```ts
const blockNumber = await client.getBlockNumber() // [!code focus:10]
```

## Parameters

### transport

- **Type:** [Transport](/docs/glossary/types#transport)

The [Transport](/docs/clients/intro) of the Public Client. 

```ts
const client = createPublicClient({
  chain: mainnet,
  transport: http(), // [!code focus]
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

The [Chain](/docs/clients/chains) of the Public Client. 

```ts
const client = createPublicClient({
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

```ts
const client = createPublicClient({
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

```ts
const client = createPublicClient({
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
- **Default:** `16`

The maximum number of milliseconds to wait before sending a batch.

```ts
const client = createPublicClient({
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

```ts
const client = createPublicClient({
  chain: mainnet,
  key: 'public', // [!code focus]
  transport: http(),
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Public Client"`

A name for the Client.

```ts
const client = createPublicClient({
  chain: mainnet,
  name: 'Public Client', // [!code focus]
  transport: http(),
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts
const client = createPublicClient({
  chain: mainnet,
  pollingInterval: 10_000, // [!code focus]
  transport: http(),
})
```

## Live Example

Check out the usage of `createPublicClient` in the live [Public Client Example](https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/clients/public-client) below.

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/clients/public-client?embed=1&file=index.ts&hideNavigation=1&hideDevTools=true&terminalHeight=0&ctl=1"></iframe>