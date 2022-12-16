# Public Client

The `createPublicClient` function sets up a Public Client with a given [Transport](/TODO) configured for a [Chain](/TODO).

The Public Client provides access to [Public Actions](#supported-actions)

## Import

```ts
import { createPublicClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/TODO) (e.g. `mainnet`) and [Transport](/TODO) (e.g. `http`).

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({ 
  chain: mainnet,
  transport: http()
})
```

## Configuration

### transport

- **Type:** [Transport](/TODO)

The [Transport](/TODO) of the Public Client. 

```ts
const client = createPublicClient({
  chain: mainnet,
  transport: http(), // [!code focus]
})
```

### chain (optional)

- **Type:** [Chain](/TODO)

The [Chain](/TODO) of the Public Client. 

```ts
const client = createPublicClient({
  chain: mainnet, // [!code focus]
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

## Supported actions

- [`fetchBalance`](/docs/fetchBalance)
- [`fetchBlock`](/docs/fetchBlock)
- [`fetchBlockNumber`](/docs/fetchBlockNumber)
- [`fetchTransaction`](/docs/fetchTransaction)
- [`watchBlock`](/docs/watchBlock)
- [`watchBlockNumber`](/docs/watchBlockNumber)
