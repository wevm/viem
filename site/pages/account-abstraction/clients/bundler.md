# Bundler Client [A function to create a Bundler Client.]

A Bundler Client is an interface to interact with **ERC-4337 Bundlers** and provides the ability to send and retrieve **User Operations** through **Bundler Actions**.

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

### account

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

### chain

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
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

### client

- **Type:** `Client`

The [Client](/docs/clients/public) (pointing to execution RPC) of the Bundler Client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
// ---cut---
import { createPublicClient, http } from 'viem' 
import { mainnet } from 'viem/chains'

const client = createPublicClient({ // [!code focus]
  chain: mainnet, // [!code focus]
  transport: http() // [!code focus]
}) // [!code focus]

const bundlerClient = createBundlerClient({
  client, // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

### key

- **Type:** `string`
- **Default:** `"wallet"`

A key for the Client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createBundlerClient({
  key: 'foo', // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

### name

- **Type:** `string`
- **Default:** `"Wallet Client"`

A name for the Client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createBundlerClient({
  name: 'Foo Bundler Client', // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

### pollingInterval

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createBundlerClient({
  pollingInterval: 10_000, // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

### rpcSchema

- **Type:** `RpcSchema`
- **Default:** `WalletRpcSchema`

Typed JSON-RPC schema for the client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// @noErrors
// ---cut---
import { rpcSchema } from 'viem'

type CustomRpcSchema = [{ // [!code focus]
  Method: 'eth_wagmi', // [!code focus]
  Parameters: [string] // [!code focus]
  ReturnType: string // [!code focus]
}] // [!code focus]

const client = createBundlerClient({
  rpcSchema: rpcSchema<CustomRpcSchema>(), // [!code focus]
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})

const result = await client.request({ // [!code focus]
  method: 'eth_wa // [!code focus] 
//               ^|

  params: ['hello'], // [!code focus]
}) // [!code focus]
```

### transport

- **Type:** `Transport`

The Transport of the Bundler Client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'), // [!code focus]
})
```

### userOperation

Configuration for User Operations.

#### userOperation.estimateFeesPerGas

- **Type:** `({ account: Account, bundlerClient: Client, userOperation: UserOperationRequest }) => Promise<{ maxFeePerGas: bigint, maxPriorityFeePerGas: bigint }>`

Prepares fee properties for the User Operation request.

```ts twoslash
// @noErrors
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
  userOperation: { // [!code focus]
    async estimateFeesPerGas({ account, bundlerClient, userOperation }) { // [!code focus]
      // Estimate fees per gas for the User Operation. // [!code focus]
      return { // [!code focus]
        maxFeePerGas: /* ... */, // [!code focus]
        maxPriorityFeePerGas: /* ... */, // [!code focus]
      } // [!code focus]
    } // [!code focus]
  } // [!code focus]
})
```

#### userOperation.sponsorUserOperation

- **Type:** `({ account: Account, bundlerClient: Client, userOperation: UserOperationRequest }) => Promise<UserOperationRequest>`

Prepares sponsorship properties for the User Operation request.

```ts twoslash
// @noErrors
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
import { client } from './config'
import { formatUserOperationRequest } from 'viem/account-abstraction'

const bundlerClient = createBundlerClient({
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet'),
  userOperation: { // [!code focus]
    async sponsorUserOperation({ account, bundlerClient, userOperation }) { // [!code focus]
      // Retrieve sponsorship properties for the User Operation. // [!code focus]
      const request = await client.request({ // [!code focus]
        method: 'pm_sponsorUserOperation', // [!code focus]
        params: [formatUserOperationRequest(userOperation)], // [!code focus]
      }) // [!code focus]
      return request // [!code focus]
    } // [!code focus]
  } // [!code focus]
})
```