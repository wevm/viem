# Sending User Operations

The guide below demonstrates how to send User Operations with a [Smart Account](/account-abstraction/accounts/smart).

## Overview

Here is an end-to-end overview of how to broadcast a User Operation with a Smart Account. We will break it down into [Steps](#steps) below.

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { bundlerClient } from './config.js'
 
const hash = await bundlerClient.sendUserOperation({ 
  account, 
  calls: [{ 
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', 
    value: parseEther('0.001') 
  }] 
}) 
 
const receipt = await bundlerClient.waitForUserOperationReceipt({ hash }) 
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { 
  createBundlerClient, 
  toCoinbaseSmartAccount 
} from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 
 
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
 
const owner = privateKeyToAccount('0x...')
 
const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 

export const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

:::

## Steps

### 1. Set up a Client

A Smart Account needs access to the Network to query for information about its state (e.g. nonce, address, etc). Let's set up a Client that we can use for the Smart Account:

```ts twoslash
// @noErrors
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

[See `createPublicClient` Docs](/docs/clients/public)

### 2. Set up a Bundler Client

Next, we will need to set up a Bundler Client. A Bundler is required to submit User Operations to the Blockchain for the Smart Account.

```ts twoslash
import { createPublicClient, http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction' // [!code ++] // [!code focus]
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({ // [!code ++] // [!code focus]
  client, // [!code ++] // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc'), // [!code ++] // [!code focus]
}) // [!code ++] // [!code focus]
```

:::info
The Bundler URL above is a public endpoint. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Bundler](https://www.pimlico.io), [Biconomy's Bundler](https://www.biconomy.io), or another Bundler service.
:::

[See `createBundlerClient` Docs](/account-abstraction/clients/bundler)

### 3. Set up an Owner

We will also need to set up an Owner for the Smart Account which will be used to sign User Operations (transactions) for the Smart Account.

```ts twoslash
// @noErrors
import { createPublicClient, http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' // [!code ++] // [!code focus]

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const owner = privateKeyToAccount('0x...') // [!code ++] // [!code focus]
```

[See `privateKeyToAccount` Docs](/docs/accounts/local/privateKeyToAccount)

### 4. Create a Smart Account

Next, we will instantiate a Smart Account. For this example, we will use [`toCoinbaseSmartAccount`](/account-abstraction/accounts/smart/toCoinbaseSmartAccount) (Coinbase Smart Wallet).

```ts twoslash
// @noErrors
import { createPublicClient, http } from 'viem'
import { // [!code ++] // [!code focus]
  createBundlerClient, // [!code ++] // [!code focus]
  toCoinbaseSmartAccount // [!code ++] // [!code focus]
} from 'viem/account-abstraction' // [!code ++] // [!code focus]
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const owner = privateKeyToAccount('0x...')

const account = await toCoinbaseSmartAccount({ // [!code ++] // [!code focus]
  client, // [!code ++] // [!code focus]
  owners: [owner] // [!code ++] // [!code focus]
}) // [!code ++] // [!code focus]
```

:::tip
**Tip:** `toCoinbaseSmartAccount` also accepts [Passkey (WebAuthn) Accounts](/account-abstraction/accounts/webauthn) as an `owner`.
:::

[See `toCoinbaseSmartAccount` Docs](/account-abstraction/accounts/smart/toCoinbaseSmartAccount)

### 5. Send User Operation

Next, we will send a User Operation to the Bundler. For the example below, we will send 0.001 ETH to a random address.

```ts twoslash
import { createPublicClient, http, parseEther } from 'viem'
import { 
  createBundlerClient, 
  toCoinbaseSmartAccount 
} from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const bundlerClient = createBundlerClient({
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const owner = privateKeyToAccount('0x...')

const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 

const hash = await bundlerClient.sendUserOperation({ // [!code ++] // [!code focus]
  account, // [!code ++] // [!code focus]
  calls: [{ // [!code ++] // [!code focus]
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D', // [!code ++] // [!code focus]
    value: parseEther('0.001') // [!code ++] // [!code focus]
  }] // [!code ++] // [!code focus]
}) // [!code ++] // [!code focus]

const receipt = await bundlerClient.waitForUserOperationReceipt({ hash }) // [!code ++] // [!code focus]
```

:::tip
**Tip:** The `calls` property also accepts [Contract Write calls](/account-abstraction/actions/bundler/sendUserOperation#contract-calls).
:::

[See `sendUserOperation` Docs](/account-abstraction/actions/bundler/sendUserOperation)

### 6. Optional: Hoist the Account

If you do not wish to pass an account around to every Action that requires an `account`, you can also hoist the account onto a Wallet Client.

```ts twoslash 
import { createPublicClient, http, parseEther } from 'viem'
import { createBundlerClient, toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 

const bundlerClient = createBundlerClient({
  account, // [!code ++]
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const hash = await bundlerClient.sendUserOperation({
  account, // [!code --]
  calls: [{
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
    value: parseEther('0.001')
  }]
})
```

### 7. Optional: Sponsor User Operation 

By using a Paymaster, we can add sponsorship of User Operation fees.

Viem exposes a `paymaster` property on both the **Bundler Client** ("on Client" tab) and **User Operation Action** ("on Action" tab) to add User Operation sponsorship capabilities.

The `paymaster` property accepts a [Paymaster Client](/account-abstraction/clients/paymaster) ([among others](/account-abstraction/actions/bundler/sendUserOperation#paymaster-optional)), which is used to fetch the necessary data for User Operation sponsorship.

:::info
The example below uses [Pimlico's Paymaster API](https://docs.pimlico.io/infra/paymaster) – allowing consumers to sponsor gas fees for users on over 30+ chains.
:::

:::code-group

```ts twoslash [example.ts (on Client)]
import { http } from 'viem'
import { 
  createBundlerClient, 
  createPaymasterClient,
} from 'viem/account-abstraction'
import { account, client } from './config.ts'

const paymasterClient = createPaymasterClient({ // [!code ++]
  transport: http('https://public.pimlico.io/v2/11155111/rpc'), // [!code ++]
}) // [!code ++]

const bundlerClient = createBundlerClient({
  account,
  client,
  paymaster: paymasterClient, // [!code ++]
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const hash = await bundlerClient.sendUserOperation({
  calls: [{
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
    value: parseEther('0.001')
  }]
})
```

```ts twoslash [example.ts (on Action)]
import { http } from 'viem'
import { 
  createBundlerClient, 
  createPaymasterClient,
} from 'viem/account-abstraction'
import { account, client } from './config.ts'

const paymasterClient = createPaymasterClient({ // [!code ++]
  transport: http('https://api.pimlico.io/v2/1/rpc?apikey={API_KEY}'), // [!code ++]
}) // [!code ++]

const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const hash = await bundlerClient.sendUserOperation({
  calls: [{
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
    value: parseEther('0.001')
  }]
  paymaster: paymasterClient, // [!code ++]
})
```

```ts twoslash [config.ts] filename="config.ts"
// @noErrors
import { createPublicClient, http, parseEther } from 'viem'
import { createBundlerClient, toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

export const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 
```

:::

::::tip
If your Bundler also supports Paymaster sponsorshop (`pm_` JSON-RPC methods), you can set `paymaster: true` instead of declaring a separate Paymaster Client.

:::code-group

```ts twoslash [example.ts (on Client)]
import { http } from 'viem'
import { 
  createBundlerClient, 
  createPaymasterClient,
} from 'viem/account-abstraction'
import { account, client } from './config.ts'

const paymasterClient = createPaymasterClient({ // [!code --]
  transport: http('https://public.pimlico.io/v2/1/rpc'), // [!code --]
}) // [!code --]

const bundlerClient = createBundlerClient({
  account,
  client,
  paymaster: paymasterClient, // [!code --]
  paymaster: true, // [!code ++]
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

```ts twoslash [example.ts (on Action)]
import { http } from 'viem'
import { 
  createBundlerClient, 
  createPaymasterClient,
} from 'viem/account-abstraction'
import { account, client } from './config.ts'

const paymasterClient = createPaymasterClient({ // [!code --]
  transport: http('https://public.pimlico.io/v2/1/rpc'), // [!code --]
}) // [!code --]

const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})

const hash = await bundlerClient.sendUserOperation({
  calls: [{
    to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
    value: parseEther('0.001')
  }]
  paymaster: paymasterClient, // [!code --]
  paymaster: true, // [!code ++]
})
```

```ts twoslash [config.ts] filename="config.ts"
// @noErrors
import { createPublicClient, http, parseEther } from 'viem'
import { createBundlerClient, toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts' 

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const owner = privateKeyToAccount('0x...')

export const account = await toCoinbaseSmartAccount({ 
  client, 
  owners: [owner]
}) 
```

:::

::::