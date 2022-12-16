# Test Client

The `createTestClient` function sets up a Test RPC Client with a given [Transport](/TODO).

The Test RPC Client provides access to [Test Actions](#supported-actions).

## Import

```ts
import { createTestClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Chain](/TODO), [Transport](/TODO) (e.g. `http`) and [mode](#mode) (e.g. `"anvil"`).

```ts
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient({
  chain: foundry,
  mode: 'anvil',
  transport: http(), 
})
```

## Configuration

### mode

- **Type:** `"anvil" | "hardhat"`

Mode of the Test Client.

```ts
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', // [!code focus]
  transport: http(), 
})
```

### transport

- **Type:** [Transport](/TODO)

[Transport](/TODO) of the Test Client.

```ts
const client = createTestClient({
  chain: foundry,
  mode: 'anvil', 
  transport: http(),  // [!code focus]
})
```

### chain (optional)

- **Type:** [Chain](/TODO)

[Chain](/TODO) of the Test Client.

```ts
const client = createTestClient({
  chain: foundry, // [!code focus]
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

## Supported actions

- [`mine`](/docs/mine)
- [`setBalance`](/docs/setBalance)
