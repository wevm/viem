# Smart Accounts

A **Smart Account** is an account whose implementation resides in a **Smart Contract**, and implements the [ERC-4337 interface](https://eips.ethereum.org/EIPS/eip-4337#account-contract-interface). 

A **Smart Account** can be controlled by one or more **Owners**, which can be a [Local](/docs/accounts/local) or [JSON-RPC Account](/docs/accounts/jsonRpc) (if supported). The **Owner Account** is responsible for signing User Operations (transactions) on behalf of the **Smart Account**, which are then broadcasted to the Network via a [Bundler](https://eips.ethereum.org/EIPS/eip-4337#bundling).

:::warning
**Compatibility Note**

Smart Accounts are an abstraction over [ERC-4337 Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337) which avoids protocol changes to implement Account Abstraction. 

Due to its "non-native" nature, this means that Smart Accounts are incompatible with Viem's Transaction APIs such as `sendTransaction` and `writeContract`.

Sending "transactions" can be achieved by broadcasting a **User Operation** to a **Bundler**, which will then broadcast it to the Network shortly after.

The most common Actions for **User Operations** are:

- [`sendUserOperation`](/docs/actions/bundler/sendUserOperation)
- [`estimateUserOperationGas`](/docs/actions/bundler/estimateUserOperationGas)
- [`getUserOperation`](/docs/actions/bundler/getUserOperation)
- [`getUserOperationReceipt`](/docs/actions/bundler/getUserOperationReceipt)
:::

## Instantiation

### 1. Set up a Client

A Smart Account needs access to the Network to query for information about its state (e.g. nonce, address, etc). Let's set up a Client that we can use for the Smart Account:

```ts twoslash
// @noErrors
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})
```

### 2. Set up a Bundler Client

Next, we will need to set up a Bundler Client. A Bundler is required to submit User Operations to the Blockchain for the Smart Account.

```ts twoslash
import { createBundlerClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({ // [!code focus]
  chain: mainnet, // [!code focus]
  client, // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'), // [!code focus]
}) // [!code focus]
```

### 3. Set up an Owner

We will also need to set up an Owner for the Smart Account which will be used to sign User Operations (transactions) for the Smart Account.

```ts twoslash 
// @noErrors
import { createBundlerClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' // [!code focus]

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({
  chain: mainnet,
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const owner = privateKeyToAccount('0x...') // [!code focus]
```

### 4. Create a Smart Account

Next, we will instantiate a Smart Account with the [Client](/docs/clients/intro), and an Account [Implementation](/docs/accounts/smart/toSmartAccount#implementation). For this example, we will use the [`coinbase` Implementation](/docs/accounts/smart/coinbase) (Coinbase Smart Wallet).

```ts twoslash
// @noErrors
import { createBundlerClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { coinbase, toSmartAccount, privateKeyToAccount } from 'viem/accounts' // [!code focus]

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({
  chain: mainnet,
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const owner = privateKeyToAccount('0x...')

const account = await toSmartAccount({ // [!code focus]
  client, // [!code focus]
  implementation: coinbase({ // [!code focus]
    owners: [owner] // [!code focus]
  }) // [!code focus]
}) // [!code focus]
```

### 5. Consume Actions

```ts twoslash
// @noErrors
import { createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { coinbase, toSmartAccount, privateKeyToAccount } from 'viem/accounts' 

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({
  chain: mainnet,
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const owner = privateKeyToAccount('0x...')

const account = await toSmartAccount({ 
  client, 
  implementation: coinbase({ 
    owners: [owner]
  }) 
}) 

const hash = await bundlerClient.sendUserOperation({ // [!code focus]
  account, // [!code focus]
  calls: [{ // [!code focus]
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code focus]
    value: parseEther('0.001') // [!code focus]
  }] // [!code focus]
}) // [!code focus]
```

### 6. Optional: Hoist the Account

If you do not wish to pass an account around to every Action that requires an `account`, you can also hoist the account onto a Wallet Client.

```ts twoslash 
// @noErrors
import { createBundlerClient, createWalletClient, http, parseEther } from 'viem'
import { mainnet } from 'viem/chains'
import { coinbase, toSmartAccount, privateKeyToAccount } from 'viem/accounts' 

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

const account = await toSmartAccount({ 
  client, 
  implementation: coinbase({ 
    owners: [owner]
  }) 
}) 

const bundlerClient = createBundlerClient({
  account, // [!code ++]
  chain: mainnet,
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})

const hash = await bundlerClient.sendUserOperation({
  account, // [!code --]
  calls: [{
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
    value: parseEther('0.001')
  }]
})
```