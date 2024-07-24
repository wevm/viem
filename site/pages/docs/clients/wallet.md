# Wallet Client [A function to create a Wallet Client.]

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

```ts twoslash
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!)
})
```

#### 2: Set up your JSON-RPC Account

We will want to retrieve an address that we can access in our Wallet (e.g. MetaMask).

```ts twoslash
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!)
})

const [address] = await client.getAddresses() // [!code focus:10]
// or: const [address] = await client.requestAddresses() // [!code focus:10]
```

> Note: Some Wallets (like MetaMask) may require you to request access to Account addresses via [`client.requestAddresses`](/docs/actions/wallet/requestAddresses) first.

#### 3: Consume [Wallet Actions](/docs/actions/wallet/introduction)

Now you can use that address within Wallet Actions that require a signature from the user:

```ts twoslash
import 'viem/window'
// ---cut---
import { createWalletClient, custom, parseEther } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!)
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

```ts twoslash
import 'viem/window'
// ---cut---
import { createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'

const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' })

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

- [Private Key Account](/docs/accounts/local/privateKeyToAccount)
- [Mnemonic Account](/docs/accounts/local/mnemonicToAccount)
- [Hierarchical Deterministic (HD) Account](/docs/accounts/local/hdKeyToAccount)

Below are the steps to integrate a **Private Key Account**, but the same steps can be applied to **Mnemonic & HD Accounts**.

#### 1: Initialize a Wallet Client

Before we set up our Account and start consuming Wallet Actions, we will need to set up our Wallet Client with the [`http` Transport](/docs/clients/transports/http):

```ts twoslash
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: http()
})
```

#### 2: Set up your Local Account

Next, we will instantiate a Private Key Account using `privateKeyToAccount`:

```ts twoslash
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

```ts twoslash
import { createWalletClient, http, parseEther } from 'viem'
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

```ts twoslash
import { createWalletClient, http, parseEther } from 'viem'
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

```ts twoslash
// @noErrors
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const account = privateKeyToAccount('0x...')

const client = createWalletClient({ // [!code focus]
  account,
  chain: mainnet,
  transport: http()
}).extend(publicActions) // [!code ++] // [!code focus]

const { request } = await client.simulateContract({ ... }) // Public Action // [!code focus]
const hash = await client.writeContract(request) // Wallet Action // [!code focus]
```

## Parameters

### account (optional)

- **Type:** `Account | Address`

The Account to use for the Wallet Client. This will be used for Actions that require an `account` as an argument.

Accepts a [JSON-RPC Account](#json-rpc-accounts) or [Local Account (Private Key, etc)](#local-accounts-private-key-mnemonic-etc).

```ts twoslash
import 'viem/window'
// ---cut---
import { createWalletClient, custom, parseEther } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  account: '0x...', // [!code focus]
  chain: mainnet,
  transport: custom(window.ethereum!)
})

const hash = await client.sendTransaction({
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

The [Chain](/docs/chains/introduction) of the Wallet Client.

Used in the [`sendTransaction`](/docs/actions/wallet/sendTransaction) & [`writeContract`](/docs/contract/writeContract) Actions to assert that the chain matches the wallet's active chain.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createWalletClient({
  chain: mainnet, // [!code focus]
  transport: custom(window.ethereum!)
})
```

### cacheTime (optional)

- **Type:** `number`
- **Default:** `client.pollingInterval`

Time (in ms) that cached data will remain in memory.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createWalletClient({
  cacheTime: 10_000, // [!code focus]
  chain: mainnet,
  transport: custom(window.ethereum!)
})
```

### ccipRead (optional)

- **Type:** `(parameters: CcipRequestParameters) => Promise<CcipRequestReturnType> | false`
- **Default:** `true`

[CCIP Read](https://eips.ethereum.org/EIPS/eip-3668) configuration.

CCIP Read is enabled by default, but if set to `false`, the client will not support offchain CCIP lookups.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
// ---cut---
const client = createWalletClient({
  ccipRead: false, // [!code focus]
  transport: custom(window.ethereum!)
})
```

### ccipRead.request (optional)

- **Type:** `(parameters: CcipRequestParameters) => Promise<CcipRequestReturnType>`

A function that will be called to make the [offchain CCIP lookup request](https://eips.ethereum.org/EIPS/eip-3668#client-lookup-protocol).

```ts twoslash
// @noErrors
import 'viem/window'
import { createWalletClient, custom } from 'viem'
// ---cut---
const client = createWalletClient({
  ccipRead: { // [!code focus]
    async request({ data, sender, urls }) { // [!code focus]
      // ... // [!code focus]
    } // [!code focus]
  }, // [!code focus]
  transport: custom(window.ethereum!)
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"wallet"`

A key for the Client.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
// ---cut---
const client = createWalletClient({
  key: 'foo', // [!code focus]
  transport: custom(window.ethereum!)
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Wallet Client"`

A name for the Client.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
// ---cut---
const client = createWalletClient({
  name: 'Foo Wallet Client', // [!code focus]
  transport: custom(window.ethereum!)
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
// ---cut---
const client = createWalletClient({
  pollingInterval: 10_000, // [!code focus]
  transport: custom(window.ethereum!)
})
```

### rpcSchema (optional)

- **Type:** `RpcSchema`
- **Default:** `WalletRpcSchema`

Typed JSON-RPC schema for the client.

```ts twoslash
import 'viem/window'
import { createWalletClient, custom } from 'viem'
// @noErrors
// ---cut---
import { rpcSchema } from 'viem'

type CustomRpcSchema = [{ // [!code focus]
  Method: 'eth_wagmi', // [!code focus]
  Parameters: [string] // [!code focus]
  ReturnType: string // [!code focus]
}] // [!code focus]

const client = createWalletClient({
  rpcSchema: rpcSchema<CustomRpcSchema>(), // [!code focus]
  transport: custom(window.ethereum!)
})

const result = await client.request({ // [!code focus]
  method: 'eth_wa // [!code focus] 
//               ^|
  params: ['hello'], // [!code focus]
}) // [!code focus]
```