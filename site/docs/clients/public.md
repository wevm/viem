# Public Client

The `createPublicClient` function sets up a Public Client with a given [Transport](/docs/clients/intro) configured for a [Chain](/docs/clients/chains).

The Public Client provides access to [Public Actions](#supported-actions)

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

## Configuration

### transport

- **Type:** [Transport](/docs/glossary/types#TODO)

The [Transport](/docs/clients/intro) of the Public Client. 

```ts
const client = createPublicClient({
  chain: mainnet,
  transport: http(), // [!code focus]
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#TODO)

The [Chain](/docs/clients/chains) of the Public Client. 

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