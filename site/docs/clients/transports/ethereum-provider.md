# Ethereum Provider Transport

The `ethereumProvider` Transport accepts an [EIP-1193 Ethereum Provider](/TODO) as a parameter. This transport is useful for integrating with injected wallets, or wallets that provide an EIP-1193 provider (eg. WalletConnect or Coinbase SDK).

## Import

```ts
import { ethereumProvider } from 'viem'
```

## Usage

```ts 
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient(
  ethereumProvider({ provider: window.ethereum }) // [!code focus]
)
```

## Gotchas

- If you are pairing the `ethereumProvider` Transport with a [Public Client](/TODO), ensure that your provider supports [Public Actions](/TODO).


## Configuration

### provider

- **Type:** `EthereumProvider`

An [EIP-1193](/TODO) or equivalent provider with an [EIP-1193 `request`](/TODO) function.

```ts 
import { createWalletClient, ethereumProvider } from 'viem'
import { exampleProvider } from './providers' // [!code focus]

const client = createWalletClient(
  ethereumProvider({ provider: exampleProvider }) // [!code focus]
)
```

### key (optional)

- **Type:** `string`
- **Default:** `"ethereumProvider"`

A key for the Transport.

```ts 
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient(
  ethereumProvider({ 
    key: 'windowProvider', // [!code focus]
    provider: window.ethereum
  })
)
```

### name (optional)

- **Type:** `string`
- **Default:** `"Ethereum Provider"`

A name for the Transport

```ts 
import { createWalletClient, ethereumProvider } from 'viem'

const client = createWalletClient(
  ethereumProvider({ 
    name: 'Window Ethereum Provider', // [!code focus]
    provider: exampleProvider
  })
)
```