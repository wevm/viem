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

- [JSON-RPC Accounts](#json-rpc-accounts) (e.g. Browser Extension Wallets, WalletConnect, etc.).
- [Local Accounts](#local-accounts-private-key-mnemonic-etc) (e.g. private key/mnemonic wallets).

## Import

```ts
import { createWalletClient } from 'viem'
```

## JSON-RPC Accounts

A [JSON-RPC Account](/docs/accounts/jsonRpc) **defers** signing of transactions & messages to the target Wallet over JSON-RPC. An example could be sending a transaction via a Browser Extension Wallet (e.g. MetaMask) with the `window.ethereum` Provider.

Below is an example of how you can set up a JSON-RPC Account.

#### 1: Initialize a Wallet Client

Before we set up our Account and start consuming Wallet Actions, we will need to set up our Wallet Client with the [`custom` Transport](/docs/clients/transports/custom), where we will pass in the `window.ethereum` Provider:

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

#### 2: Set up your JSON-RPC Account

We will want to retrieve an address that we can access in our Wallet (e.g. MetaMask).

```ts
import { createWalletClient, custom } from 'viem' // [!code focus]
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

const [address] = await client.getAddresses() // [!code focus:10]
// or: const [address] = await client.requestAddresses() // [!code focus:10]
```

> Note: Some Wallets (like MetaMask) may require you to request access to Account addresses via [`client.requestAddresses`](/docs/actions/wallet/requestAddresses) first.

#### 3: Consume [Wallet Actions](/docs/actions/wallet/introduction)

Now you can use that address within Wallet Actions that require a signature from the user:

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

const [address] = await client.getAddresses()

const hash = await client.sendTransaction({ // [!code focus:10]
  account: address,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

#### Optional: Hoist the Account

If you do not wish to pass an account around to every Action that requires an `account`, you can also hoist the account into the Wallet Client.

```ts
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

const client = createWalletClient({ // [!code focus:99]
  account, // [!code ++]
  chain: mainnet,
  transport: http()
})

const hash = await client.sendTransaction({
  account, // [!code --]
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

## Local Accounts (Private Key, Mnemonic, etc)

A Local Account performs signing of transactions & messages with a private key **before** executing a method over JSON-RPC.

There are three types of Local Accounts in viem:

- [Private Key Account](/docs/accounts/privateKey)
- [Mnemonic Account](/docs/accounts/mnemonic)
- [Hierarchical Deterministic (HD) Account](/docs/accounts/hd)

Below are the steps to integrate a **Private Key Account**, but the same steps can be applied to **Mnemonic & HD Accounts**.

#### 1: Initialize a Wallet Client

Before we set up our Account and start consuming Wallet Actions, we will need to set up our Wallet Client with the [`http` Transport](/docs/clients/transports/http):

```ts
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: http()
})
```

#### 2: Set up your Local Account

Next, we will instantiate a Private Key Account using `privateKeyToAccount`:

```ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts' // [!code focus]
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: http()
})

const account = privateKeyToAccount('0x...') // [!code focus:1]
```

#### 3: Consume [Wallet Actions](/docs/actions/wallet/introduction)

Now you can use that Account within Wallet Actions that need a signature from the user:

```ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: http()
})

const account = privateKeyToAccount('0x...')

const hash = await client.sendTransaction({ // [!code focus:5]
  account,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

#### Optional: Hoist the Account

If you do not wish to pass an account around to every Action that requires an `account`, you can also hoist the account into the Wallet Client.

```ts
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const account = privateKeyToAccount('0x...')

const client = createWalletClient({ // [!code focus:99]
  account, // [!code ++]
  chain: mainnet,
  transport: http()
})

const hash = await client.sendTransaction({
  account, // [!code --]
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

#### Optional: Extend with Public Actions

When using a Local Account, you may be finding yourself using a [Public Client](/docs/clients/public) instantiated with the same parameters (`transport`, `chain`, etc) as your Wallet Client.

In this case, you can extend your Wallet Client with [Public Actions](/docs/actions/public/introduction) to avoid having to handle multiple Clients.

```ts {12}
import { createWalletClient, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

const account = privateKeyToAccount('0x...')

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
}).extend(publicActions) // [!code ++]

const { request } = await client.simulateContract({ ... }) // Public Action
const hash = await client.writeContract(request) // Wallet Action
```

## Parameters

### account (optional)

- **Type:** `Account | Address`

The Account to use for the Wallet Client. This will be used for Actions that require an `account` as an argument.

Accepts a [JSON-RPC Account](#json-rpc-accounts) or [Local Account (Private Key, etc)](#local-accounts-private-key-mnemonic-etc).

```ts
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const client = createWalletClient({
  account: privateKeyToAccount('0x...') // [!code focus]
  key: 'foo', 
  transport: custom(window.ethereum)
})

const hash = await client.sendTransaction({
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

The [Chain](/docs/clients/chains) of the Wallet Client.

Used in the [`sendTransaction`](/docs/actions/wallet/sendTransaction) & [`writeContract`](/docs/contract/writeContract) Actions to assert that the chain matches the wallet's active chain.

```ts
const client = createWalletClient({
  chain: mainnet, // [!code focus]
  transport: custom(window.ethereum)
})
```

### cacheTime (optional)

- **Type:** `number`
- **Default:** `client.pollingInterval`

Time (in ms) that cached data will remain in memory.

```ts
const client = createWalletClient({
  cacheTime: 10_000, // [!code focus]
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

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
