# Bundler Client [A function to create a Bundler Client.]

A Bundler Client is an interface to interact with [ERC-4337 Bundlers]() and provides the ability to send and retrieve [User Operations]() through [Bundler Actions](/account-abstraction/actions/bundler/introduction).

## Import

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
```

## Usage

```ts twoslash
import { createPublicClient, http } from 'viem'
import { createBundlerClient } from 'viem/account-abstraction' // [!code focus]
import { mainnet } from 'viem/chains' // [!code focus]

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const bundlerClient = createBundlerClient({ // [!code focus]
  client, // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet') // [!code focus]
}) // [!code focus]
```

## Parameters

### account (optional)

- **Type:** `SmartAccount`

The [Smart Account](/account-abstraction/accounts/smart) to use for the Bundler Client. This will be used for Actions that require an `account` as an argument.

```ts twoslash
import { createPublicClient, http } from 'viem' 
import { createBundlerClient } from 'viem/account-abstraction'
import { mainnet } from 'viem/chains' 

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
// ---cut---
import { toCoinbaseSmartAccount } from 'viem/account-abstraction' // [!code focus]
import { privateKeyToAccount } from 'viem/accounts'

const owner = privateKeyToAccount('0x...')

const account = await toCoinbaseSmartAccount({ // [!code focus]
  client, // [!code focus]
  owners: [owner] // [!code focus]
}) // [!code focus]

const bundlerClient = createBundlerClient({
  account, // [!code focus]
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
})
```

### chain (optional)

- **Type:** [Chain](/docs/glossary/types#chain)

The [Chain](/docs/chains/introduction) of the Bundler Client.

```ts twoslash
import { createPublicClient, http } from 'viem' 
import { createBundlerClient } from 'viem/account-abstraction'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
// ---cut---
import { mainnet } from 'viem/chains' 

const bundlerClient = createBundlerClient({
  chain: mainnet, // [!code focus]
  transport: http()
})
```

