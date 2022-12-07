# Ethereum Provider Transport

The `ethereumProvider` transport accepts an [EIP-1193 Ethereum Provider](/TODO) as a parameter. This transport is useful for integrating with injected wallets, or wallets that provide an EIP-1193 provider (eg. WalletConnect or Coinbase SDK).

## Usage

```ts {4}
import { createWalletClient, ethereumProvider } from 'viem/clients'

const client = createWalletClient(
  ethereumProvider({ provider: window.ethereum }),
)
```

## Gotchas

- It is generally not recommended to pair the `ethereumProvider` transport with a [Network Client](/TODO). This is because some wallets restrict access to public actions (such as `fetchBlockNumber`).
