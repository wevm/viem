---
head:
  - - meta
    - property: og:title
      content: Wallet Client
  - - meta
    - name: description
      content: A function to create a Wallet Client.
  - - meta
    - property: og:description
      content: A function to create a Wallet Client.

---

# Wallet Client

A Wallet Client is an interface to interact with [Ethereum Account(s)](https://ethereum.org/en/glossary/#account) and provides the ability to retrieve accounts, execute transactions, sign messages, etc through [Wallet Actions](/docs/actions/wallet/introduction).

The `createWalletClient` function sets up a Wallet Client with a given [Transport](/docs/clients/intro).

The Wallet Client currently only supports signing over JSON-RPC (ie. Browser Extension Wallets, WalletConnect, etc). Support for [Externally Owned Account](/docs/glossary/terms#TODO) & private key signing is coming shortly.

## Import

```ts
import { createWalletClient } from 'viem'
```

## Usage

### JSON-RPC Accounts

A JSON-RPC Account **defers** signing of transactions & messages to the target Wallet over JSON-RPC. An example could be sending a transaction via a Browser Extension Wallet with the `window.ethereum` Provider.

Initialize a Wallet Client with your desired [Transport](/docs/clients/intro) (e.g. `custom`):

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})
```

Then you can consume [Wallet Actions](/docs/actions/wallet/introduction):

```ts
const accounts = await client.requestAccounts() // [!code focus:10]
const hash = await client.sendTransaction({
  from: accounts[0],
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

### Externally Owned Accounts 🚧

An Externally Owned Account performs signing of transactions & messages with a private key **before** executing a method over JSON-RPC.

**Coming soon.**

## Parameters

### key (optional)

- **Type:** `string`
- **Default:** `"wallet"`

A key for the Client.

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  key: 'foo', // [!code focus]
  transport: custom(window.ethereum)
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Wallet Client"`

A name for the Client.

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  name: 'Foo Wallet Client', // [!code focus]
  transport: custom(window.ethereum)
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  pollingInterval: 10_000, // [!code focus]
  transport: custom(window.ethereum)
})
```