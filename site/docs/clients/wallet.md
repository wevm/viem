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

The Wallet Client currently only supports signing over:
- a [JSON-RPC Account](#json-rpc-accounts) (ie. Browser Extension Wallets, WalletConnect, etc). 
- an [Externally Owned Account](#externally-owned-accounts) (ie. private key).

## Import

```ts
import { createWalletClient } from 'viem'
```

## JSON-RPC Accounts

A JSON-RPC Account **defers** signing of transactions & messages to the target Wallet over JSON-RPC. An example could be sending a transaction via a Browser Extension Wallet (e.g. MetaMask) with the `window.ethereum` Provider.

Below is an example of how you can set up a JSON-RPC Account.

#### Initialize a Wallet Client

Before we set up our Account and start consuming Wallet Actions, we will need to set up our Wallet Client with the [`custom` Transport](/docs/clients/transports/custom), where we will pass in the `window.ethereum` Provider:

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})
```

#### Set up your JSON-RPC Account

We will want to retrieve a list of addresses we can access in our Wallet (e.g. MetaMask), and then use one of them to retrieve an Account:

```ts
import { createWalletClient, custom, getAccount } from 'viem' // [!code focus]

const client = createWalletClient({
  transport: custom(window.ethereum)
})

const [address] = await client.getAddresses() // [!code focus:10]
const account = getAccount(address)
```

#### Consume [Wallet Actions](/docs/actions/wallet/introduction)

Now you can use that Account within Wallet Actions that require a signature from the user:

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})

const [address] = await client.getAddresses()
const account = getAccount(address)

const hash = await client.sendTransaction({ // [!code focus:10]
  account,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

## Externally Owned Accounts (Experimental)

::: warning
Externally Owned Accounts are currently experimental. Use with caution.
:::

An Externally Owned Account performs signing of transactions & messages with a private key **before** executing a method over JSON-RPC.

viem currently does not support client-side signing (coming soon!). For now, you can pass in an Ethers Wallet, or your own definition of an Externally Owned Account.

### Ethers Wallet

Below are the steps to integrate an Ethers `Wallet` into viem.

#### Initialize a Wallet Client

Before we set up our Account and start consuming Wallet Actions, we will need to set up our Wallet Client with the [`http` Transport](/docs/clients/transports/http):

```ts
import { createWalletClient, http } from 'viem'

const client = createWalletClient({
  transport: http()
})
```

#### Set up your Externally Owned Account

Next, we will instantiate a viem Account using an Ethers `Wallet`:

```ts
import { createWalletClient, http, getAccount } from 'viem'
import { getAccount } from 'viem/ethers' // [!code focus]
import { Wallet } from 'ethers' // [!code focus]

const client = createWalletClient({
  transport: http()
})

const privateKey = '0x...' // [!code focus]
const account = getAccount(new Wallet(privateKey)) // [!code focus]
```

#### Consume [Wallet Actions](/docs/actions/wallet/introduction)

Now you can use that Account within Wallet Actions that require a signature from the user:

```ts
import { createWalletClient, http, getAccount } from 'viem'
import { getAccount } from 'viem/ethers'
import { Wallet } from 'ethers'

const client = createWalletClient({
  transport: http()
})

const privateKey = '0x...'
const account = getAccount(new Wallet(privateKey))

const hash = await client.sendTransaction({ // [!code focus:5]
  account,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

### Custom

You can also pass in your own definition of an Externally Owned Account through the `getAccount` function:

```ts
import { getAccount } from 'viem'
import { getAddress, signTransaction } from './custom-signer'

const privateKey = '0x...'
const account = getAccount({
  address: getAddress(privateKey),
  signTransaction(transaction) {
    return signTransaction(transaction, privateKey)
  }
})
```

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