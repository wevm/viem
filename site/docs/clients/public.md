# Public Client

The `createPublicClient` function sets up a Public Client with a given [transport](/TODO) configured for a [chain](/TODO).

The Public Client provides access to [public actions](#supported-actions)

## Usage

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(http({ chain: mainnet }))
```

## Configuration

### key (optional)

- **Type:** `string`

A key for the client.

```ts
const client = createPublicClient(
  http({ chain: mainnet }),
  { key: 'foo' }, // [!code focus]
)
```

### name (optional)

- **Type:** `string`

A name for the client.

```ts
const client = createPublicClient(
  http({ chain: mainnet }),
  { name: 'Foo Client' }, // [!code focus]
)
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled actions & events.

```ts
const client = createPublicClient(
  http({ chain: mainnet }),
  { pollingInterval: 10_000 }, // [!code focus]
)
```

## Supported actions

- [`fetchBalance`](/docs/fetchBalance)
- [`fetchBlock`](/docs/fetchBlock)
- [`fetchBlockNumber`](/docs/fetchBlockNumber)
- [`fetchTransaction`](/docs/fetchTransaction)
- [`watchBlock`](/docs/watchBlock)
- [`watchBlockNumber`](/docs/watchBlockNumber)
