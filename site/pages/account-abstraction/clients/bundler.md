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
  transport: http('https://public.pimlico.io/v2/1/rpc') // [!code focus]
}) // [!code focus]
```

:::info
The Bundler URL above is a public endpoint. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Bundler](https://www.pimlico.io), [Biconomy's Bundler](https://www.biconomy.io), or another Bundler service.
:::

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
  transport: http('https://public.pimlico.io/v2/1/rpc'),
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
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

### client (optional)

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
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

### key (optional)

- **Type:** `string`
- **Default:** `"bundler"`

A key for the Client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createBundlerClient({
  key: 'foo', // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Bundler Client"`

A name for the Client.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createBundlerClient({
  name: 'Foo Bundler Client', // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

### paymaster (optional)

- **Type:** `true | PaymasterClient | { getPaymasterData: typeof getPaymasterData, getPaymasterStubData: typeof getPaymasterStubData }`

Sets Paymaster configuration for the Bundler Client to be utilized on User Operations.

- If `paymaster: PaymasterClient`, it will use the provided [Paymaster Client](/account-abstraction/clients/paymaster) for User Operation sponsorship.
- If `paymaster: true`, it will be assumed that the Bundler Client also supports Paymaster RPC methods (e.g. `pm_getPaymasterData`), and use them for User Operation sponsorship.
- If [custom functions](#paymastergetpaymasterdata-optional) are provided to `paymaster`, it will use them for User Operation sponsorship.

#### Using a Paymaster Client

```ts twoslash
// @noErrors
import { createPaymasterClient, createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { client } from './config'
// ---cut---
const paymasterClient = createPaymasterClient({ // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc') // [!code focus]
}) // [!code focus]

const bundlerClient = createBundlerClient({
  chain: mainnet,
  paymaster: paymasterClient, // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

#### Using the Bundler Client as Paymaster

```ts twoslash
// @noErrors
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const bundlerClient = createBundlerClient({
  chain: mainnet,
  paymaster: true, // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

#### Using Custom Paymaster Functions

See the [properties below](#paymastergetpaymasterdata-optional) for more information on how to use custom Paymaster functions.

### paymaster.getPaymasterData (optional)

- **Type:** `(userOperation: UserOperation) => Promise<GetPaymasterDataReturnType>`

Retrieves paymaster-related User Operation properties to be used for sending the User Operation.

[Read more](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7677.md#pm_getpaymasterdata)

```ts twoslash
// @noErrors
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const bundlerClient = createBundlerClient({
  chain: mainnet,
  paymaster: { // [!code focus]
    async getPaymasterData(userOperation) { // [!code focus]
      // Retrieve paymaster properties for the User Operation. // [!code focus]
      return { // [!code focus]
        paymaster: '0x...', // [!code focus]
        paymasterData: '0x...', // [!code focus]
        paymasterVerificationGasLimit: 69420n, // [!code focus]
        paymasterPostOpGasLimit: 69420n, // [!code focus]
      } // [!code focus]
    } // [!code focus]
  } // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

### paymaster.getPaymasterStubData (optional)

- **Type:** `(userOperation: UserOperation) => Promise<GetPaymasterStubDataReturnType>`

Retrieves paymaster-related User Operation properties to be used for gas estimation.

[Read more](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7677.md#pm_getpaymasterstubdata)

```ts twoslash
// @noErrors
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const bundlerClient = createBundlerClient({
  chain: mainnet,
  paymaster: { 
    async getPaymasterStubData(userOperation) { // [!code focus]
      // Retrieve paymaster properties for the User Operation. // [!code focus]
      return { // [!code focus]
        paymaster: '0x...', // [!code focus]
        paymasterData: '0x...', // [!code focus]
        paymasterVerificationGasLimit: 69420n, // [!code focus]
        paymasterPostOpGasLimit: 69420n, // [!code focus]
      } // [!code focus]
    } // [!code focus]
    async getPaymasterData(userOperation) { /* ... */ }
  } 
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

### paymasterContext (optional)

- **Type:** `unknown`

Paymaster specific fields.

```ts twoslash
// @noErrors
import { createPaymasterClient, createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { client } from './config'
// ---cut---
const paymasterClient = createPaymasterClient({
  transport: http('https://public.pimlico.io/v2/1/rpc')
})

const bundlerClient = createBundlerClient({
  chain: mainnet,
  paymaster: paymasterClient,
  paymasterContext: { // [!code focus]
    policyId: 'abc123' // [!code focus]
  }, // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc'),
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts twoslash
import { createBundlerClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createBundlerClient({
  pollingInterval: 10_000, // [!code focus]
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

### rpcSchema (optional)

- **Type:** `RpcSchema`
- **Default:** `BundlerRpcSchema`

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
  transport: http('https://public.pimlico.io/v2/1/rpc')
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
  transport: http('https://public.pimlico.io/v2/1/rpc'), // [!code focus]
})
```

### userOperation (optional)

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
  transport: http('https://public.pimlico.io/v2/1/rpc'),
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
