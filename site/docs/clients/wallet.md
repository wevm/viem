# Wallet Client

The `createWalletClient` function sets up a Wallet Client with a given [transport](/TODO).

::: info
The Wallet Client provides access to **wallet & signable actions**.
:::

## Usage

```ts
import { createWalletClient, http } from 'viem/clients'
import { mainnet } from 'viem/chains'

const client = createWalletClient(http({ chain: mainnet }))
```

## Supported actions

- [`requestAccounts`](/docs/requestAccounts)
- [`sendTransaction`](/docs/sendTransaction)
