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

The Wallet Client supports signing over:
- a [JSON-RPC Account](#json-rpc-accounts) (ie. Browser Extension Wallets, WalletConnect, etc). 
- a [Local Account](#local-accounts) (ie. local private key/mnemonic wallets).

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
// or: const [address] = await client.requestAddresses() // [!code focus:10]
const account = getAccount(address)
```

> Note: Some Wallets (like MetaMask) may require you to request access to Account addresses via [`client.requestAddresses`](/docs/actions/wallet/requestAddresses) first.

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

## Local Accounts (Experimental)

::: warning
Local Accounts are currently experimental. Use with caution.
:::

A Local Account performs signing of transactions & messages with a private key **before** executing a method over JSON-RPC.

Below are the steps to integrate an Local Account into viem.

#### Initialize a Wallet Client

Before we set up our Account and start consuming Wallet Actions, we will need to set up our Wallet Client with the [`http` Transport](/docs/clients/transports/http):

```ts
import { createWalletClient, http } from 'viem'

const client = createWalletClient({
  transport: http()
})
```

#### Set up your Local Account

Next, we will instantiate a viem Account using `getAccount`.

viem currently **does not have client-side signing utilities** (coming soon!). For now, you will have to bring your own signing utilities and pass them through to the `getAccount` function:

```ts
import { createWalletClient, http, getAccount } from 'viem'
import { getAddress, signMessage, signTransaction } from './sign-utils' // [!code focus]

const client = createWalletClient({
  transport: http()
})

const privateKey = '0x...' // [!code focus:10]
const account = getAccount({
  address: getAddress(privateKey),
  signMessage(message) {
    return signMessage(message, privateKey)
  },
  signTransaction(transaction) {
    return signTransaction(transaction, privateKey)
  }
})
```

> Tip: Instead of building private key signing utilities yourself, you can plug in a third-party signer into the `getAccount` interface. We have an [Ethers.js Wallet Adapter](#ethers-js-wallet) if you are coming from Ethers.js, but you could also hook up a [web3.js Wallet](https://web3js.readthedocs.io/en/v1.8.2/web3-eth-accounts.html#wallet-add), [micro-eth-signer](https://github.com/paulmillr/micro-eth-signer), etc to the `getAccount` interface.

#### Consume [Wallet Actions](/docs/actions/wallet/introduction)

Now you can use that Account within Wallet Actions that need a signature from the user:

```ts
import { createWalletClient, http, getAccount } from 'viem'
import { getAddress, signMessage, signTransaction } from './sign-utils'

const client = createWalletClient({
  transport: http()
})

const privateKey = '0x...'
const account = getAccount({
  address: getAddress(privateKey),
  signMessage(message) {
    return signMessage(message, privateKey)
  },
  signTransaction(transaction) {
    return signTransaction(transaction, privateKey)
  }
})

const hash = await client.sendTransaction({ // [!code focus:5]
  account,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
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

## Ethers.js Wallet

::: warning
Local Accounts are currently experimental. Use with caution.
:::

```ts
import { createWalletClient, http } from 'viem'
import { getAccount } from 'viem/ethers' // [!code focus:2]
import { Wallet } from 'ethers'

const client = createWalletClient({
  transport: http()
})

const privateKey = '0x...' // [!code focus:2]
const account = getAccount(new Wallet(privateKey))

const hash = await client.sendTransaction({ 
  account,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```