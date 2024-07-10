# Smart Accounts

A **Smart Account** is an account whose implementation resides in a **Smart Contract**, and implements the [ERC-4337 interface](https://eips.ethereum.org/EIPS/eip-4337#account-contract-interface). 

A **Smart Account** can be controlled by one or more **Owners**, which can be a [Local](/docs/accounts/local) or [JSON-RPC Account](/docs/accounts/json-rpc). The **Owner Account** is responsible for signing User Operations (transactions) on behalf of the **Smart Account**, which are then broadcasted to the Blockchain via a [Bundler](https://eips.ethereum.org/EIPS/eip-4337#bundling).

## Instantiation

### 1. Set up a Bundler Client

Firstly, we will need to set up a Bundler Client. A Bundler is required to submit User Operations to the Blockchain for the Smart Account.

```ts twoslash
import { createBundlerClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})
```

### 2. Set up a Client

A Smart Account needs access to the Blockchain to query for information about its state (e.g. nonce, address, etc). Let's set up a Client that we can use for the Smart Account:

```ts twoslash
// @noErrors
import { createBundlerClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({ // [!code focus]
  bundlerClient, // [!code focus]
  chain: mainnet, // [!code focus]
  transport: http(), // [!code focus]
}) // [!code focus]
```

### 3. Set up an Owner

We will also need to set up an Owner for the Smart Account which will be used to sign User Operations (transactions) for the Smart Account.

The example below demonstrates how to instantiate an Owner as a:

- [Local Account](/docs/accounts/local) (private key, mnemonic, etc)
- [JSON-RPC Account](/docs/accounts/jsonRpc) (Browser Extension/WalletConnect)

:::code-group

```ts twoslash [Local Account]
// @noErrors
import { createBundlerClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' // [!code focus]

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  bundlerClient,
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...') // [!code focus]
```

```ts twoslash [JSON-RPC Account]
// @noErrors
import { createBundlerClient, createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const bundlerClient = createBundlerClient({
  bundlerClient,
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  bundlerClient,
  chain: mainnet,
  transport: custom(window.ethereum!)
})

const [owner] = await client.getAddresses() // [!code focus]
```

:::

### 4. Create a Smart Account

Next, we will instantiate a Smart Account with the [Client](/docs/clients/intro), and an Account [Implementation](/docs/accounts/implementations/custom). For this example, we will use the [`solady` Implementation](/docs/accounts/implementations/solady).

:::code-group

```ts twoslash [Local Account]
// @noErrors
import { createBundlerClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { toSmartAccount, privateKeyToAccount, solady } from 'viem/accounts' // [!code focus]

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  bundlerClient,
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

const account = await toSmartAccount({ // [!code focus]
  client, // [!code focus]
  implementation: solady({ // [!code focus]
    factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', // [!code focus]
    owner // [!code focus]
  }) // [!code focus]
}) // [!code focus]
```

```ts twoslash [JSON-RPC Account]
// @noErrors
import { createBundlerClient, createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { toSmartAccount, solady } from 'viem/accounts' // [!code focus]

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  bundlerClient,
  chain: mainnet,
  transport: custom(window.ethereum!)
})

const [owner] = await client.getAddresses()

const account = await toSmartAccount({ // [!code focus]
  client, // [!code focus]
  implementation: solady({ // [!code focus]
    factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', // [!code focus]
    owner // [!code focus]
  }) // [!code focus]
}) // [!code focus]
```

:::

### 5. Consume Actions

:::code-group

```ts twoslash [Local Account]
// @noErrors
import { createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { toSmartAccount, privateKeyToAccount, solady } from 'viem/accounts' 

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  bundlerClient,
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

const account = await toSmartAccount({ 
  client, 
  implementation: solady({ 
    factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', 
    owner 
  }) 
}) 

const hash = await client.sendTransaction({ // [!code focus]
  account, // [!code focus]
  to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
  value: parseEther('0.001') // [!code focus]
}) // [!code focus]
```

```ts twoslash [JSON-RPC Account]
// @noErrors
import { createWalletClient, custom, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { toSmartAccount, solady } from 'viem/accounts' 

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  bundlerClient,
  chain: mainnet,
  transport: custom(window.ethereum!)
})

const [owner] = await client.getAddresses()

const account = await toSmartAccount({ 
  client, 
  implementation: solady({ 
    factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', 
    owner 
  }) 
}) 

const hash = await client.sendTransaction({ // [!code focus]
  account, // [!code focus]
  to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
  value: parseEther('0.001') // [!code focus]
}) // [!code focus]
```

:::

### 6. Optional: Hoist the Account

If you do not wish to pass an account around to every Action that requires an `account`, you can also hoist the account onto a Wallet Client.

:::code-group

```ts twoslash [Local Account]
// @noErrors
import { createBundlerClient, createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { toSmartAccount, privateKeyToAccount, solady } from 'viem/accounts' 

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

const account = await toSmartAccount({ 
  client, 
  implementation: solady({ 
    factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', 
    owner 
  }) 
}) 

const smartWalletClient = createWalletClient({ // [!code ++]
  account, // [!code ++]
  bundlerClient, // [!code ++]
  chain: mainnet, // [!code ++]
  transport: http() // [!code ++]
}) // [!code ++]

const hash = await smartWalletClient.sendTransaction({
  to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
  value: parseEther('0.001')
})
```

```ts twoslash [JSON-RPC Account]
// @noErrors
import { createBundlerClient, createWalletClient, custom, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { toSmartAccount, solady } from 'viem/accounts' 

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!)
})

const [owner] = await client.getAddresses()

const account = await toSmartAccount({ 
  client, 
  implementation: solady({ 
    factoryAddress: '0xda4b37208c41c4f6d1b101cac61e182fe1da0754', 
    owner 
  }) 
}) 

const smartWalletClient = createWalletClient({ // [!code ++]
  account, // [!code ++]
  bundlerClient, // [!code ++]
  chain: mainnet, // [!code ++]
  transport: http() // [!code ++]
}) // [!code ++]

const hash = await smartWalletClient.sendTransaction({
  account, 
  to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', 
  value: parseEther('0.001') 
}) 
```

:::