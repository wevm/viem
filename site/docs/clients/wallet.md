# Wallet Client

The `createWalletClient` function sets up a Wallet Client with a given [transport](/TODO).

The Wallet Client provides access to [wallet & signable actions](#supported-actions)

## Usage

```ts
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient(http({ chain: mainnet }))
```

## Configuration

### key (optional)

- **Type:** `string`

A key for the client.

### name (optional)

- **Type:** `string`

A name for the client.

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled actions & events.

## Supported actions

- [`requestAccounts`](/docs/requestAccounts)
- [`sendTransaction`](/docs/sendTransaction)
