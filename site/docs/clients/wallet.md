# Wallet Client

The `createWalletClient` function sets up a Wallet Client with a given [Transport](/docs/clients/intro).

The Wallet Client provides access to [Wallet Actions](#supported-actions)

## Import

```ts
import { createWalletClient } from 'viem'
```

## Usage

Initialize a Client with your desired [Transport](/docs/clients/intro) (e.g. `ethereumProvider`).

```ts
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient({
  transport: ethereumProvider({ provider: window.ethereum })
})
```

## Configuration

### key (optional)

- **Type:** `string`
- **Default:** `"wallet"`

A key for the Client.

```ts
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient({
  key: 'foo', // [!code focus]
  transport: ethereumProvider({ provider: window.ethereum })
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Wallet Client"`

A name for the Client.

```ts
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient({
  name: 'Foo Wallet Client', // [!code focus]
  transport: ethereumProvider({ provider: window.ethereum })
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient({
  pollingInterval: 10_000, // [!code focus]
  transport: ethereumProvider({ provider: window.ethereum })
})
```