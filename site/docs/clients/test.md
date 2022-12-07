# Test Client

The `createTestClient` function sets up a Test RPC Client with a given [transport](/TODO).

The Test RPC Client provides access to [test actions](#supported-actions).

## Usage

```ts
import { createTestClient, http } from 'viem'
import { foundry } from 'viem/chains'

const client = createTestClient(http({ chain: foundry }), { mode: 'anvil' })
```

## Configuration

### mode

- **Type:** `"anvil" | "hardhat"`

Mode of the client.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil' }, // [!code focus]
)
```

### key (optional)

- **Type:** `string`

A key for the client.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil', key: 'test' }, // [!code focus]
)
```

### name (optional)

- **Type:** `string`

A name for the client.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil', name: 'Anvil Test Client' }, // [!code focus]
)
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled actions & events.

```ts
const client = createTestClient(
  http({ chain: foundry }),
  { mode: 'anvil', pollingInterval: 10_000 }, // [!code focus]
)
```

## Supported actions

- [`mine`](/docs/mine)
- [`setBalance`](/docs/setBalance)
