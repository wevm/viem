# Ethereum Provider Transport

The `ethereumProvider` Transport accepts an [EIP-1193 Ethereum Provider](/TODO) as a parameter. This transport is useful for integrating with injected wallets, or wallets that provide an EIP-1193 provider (eg. WalletConnect or Coinbase SDK).

## Import

```ts
import { ethereumProvider } from 'viem'
```

## Usage

```ts {3}
import { createWalletClient, ethereumProvider } from 'viem'

const transport = ethereumProvider({ provider: window.ethereum })

const client = createWalletClient({ transport })
```

## Gotchas

- If you are pairing the `ethereumProvider` Transport with a [Public Client](/TODO), ensure that your provider supports [Public Actions](/TODO).


## Configuration

### provider

- **Type:** `EthereumProvider`

An [EIP-1193](/TODO) or equivalent provider with an [EIP-1193 `request`](/TODO) function.

```ts
const transport = ethereumProvider({ 
  provider: window.ethereum // [!code focus]
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"ethereumProvider"`

A key for the Transport.

```ts
const transport = ethereumProvider({ 
  key: 'windowProvider', // [!code focus]
  provider: window.ethereum
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Ethereum Provider"`

A name for the Transport

```ts
const transport = ethereumProvider({ 
  name: 'Window Ethereum Provider', // [!code focus]
  provider: window.ethereum
})
```