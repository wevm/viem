# Public Client

The `createPublicClient` function sets up a Public Client with a given [Transport](/TODO) configured for a [Chain](/TODO).

The Public Client provides access to [Public Actions](#supported-actions)

## Import

```ts
import { createPublicClient } from 'viem'
```

## Usage

Initialize a Client with your desired Transport (e.g. `http`).

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient(http({ chain: mainnet })) // [!code focus]
```

## Configuration

### key (optional)

- **Type:** `string`
- **Default:** `"public"`

A key for the Client.

```ts
const client = createPublicClient(
  http({ chain: mainnet }),
  { key: 'foo' }, // [!code focus]
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"Public Client"`

A name for the Client.

```ts
const client = createPublicClient(
  http({ chain: mainnet }),
  { name: 'Foo Client' }, // [!code focus]
)
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

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
