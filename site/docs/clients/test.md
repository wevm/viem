# Test Client

The `createTestClient` function sets up a Test RPC Client with a given [Transport](/TODO).

The Test RPC Client provides access to [Test Actions](#supported-actions).

## Import

```ts
import { createTestClient } from 'viem'
```

## Usage

Initialize a Client with your desired Transport (e.g. `http`) and [mode](#mode) (e.g. `"anvil"`).

```ts
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient( // [!code focus:4]
  http({ chain: foundry }), 
  { mode: 'anvil' }
)
```

## Configuration

### mode

- **Type:** `"anvil" | "hardhat"`

Mode of the Client.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil' }, // [!code focus]
)
```

### key (optional)

- **Type:** `string`
- **Default:** `"test"`

A key for the Client.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil', key: 'test' }, // [!code focus]
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"Test Client"`

A name for the Client.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil', name: 'Anvil Test Client' }, // [!code focus]
)
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil', pollingInterval: 10_000 }, // [!code focus]
)
```

## Supported actions

- [`mine`](/docs/mine)
- [`setBalance`](/docs/setBalance)
