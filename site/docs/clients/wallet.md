# Wallet Client

The `createWalletClient` function sets up a Wallet Client with a given [Transport](/TODO).

The Wallet Client provides access to [Wallet Actions](#supported-actions)

## Import

```ts
import { createWalletClient } from 'viem'
```

## Usage

Initialize a Client with your desired Transport (e.g. `ethereumProvider`).

## Usage

```ts
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient(
  ethereumProvider({ provider: window.ethereum })
)
```

## Configuration

### key (optional)

- **Type:** `string`
- **Default:** `"wallet"`

A key for the Client.

```ts
const client = createWalletClient(
  ethereumProvider({ provider: window.ethereum }),
  { key: 'foo' }, // [!code focus]
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"Wallet Client"`

A name for the Client.

```ts
const client = createWalletClient(
  ethereumProvider({ provider: window.ethereum }),
  { key: 'Foo Wallet Client' }, // [!code focus]
)
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts
const client = createWalletClient(
  ethereumProvider({ provider: window.ethereum }),
  { pollingInterval: 10_000 }, // [!code focus]
)
```

## Supported actions

- [`requestAccounts`](/docs/requestAccounts)
- [`sendTransaction`](/docs/sendTransaction)
