# Paymaster Client [A function to create a Paymaster Client.]

A Paymaster Client is an interface to interact with **[ERC-7677 compliant Paymasters](https://eips.ethereum.org/EIPS/eip-7677)** and provides the ability to sponsor **User Operation** gas fees.

:::note
Read more on **ERC-7677 Paymasters**:
- [Website](https://erc7677.xyz/)
- [Specification](https://eips.ethereum.org/EIPS/eip-7677)
:::

## Import

```ts twoslash
import { createPaymasterClient } from 'viem/account-abstraction'
```

## Usage

```ts twoslash
import { http } from 'viem'
import { 
  createBundlerClient, 
  createPaymasterClient,
} from 'viem/account-abstraction'
import { sepolia } from 'viem/chains'

const paymasterClient = createPaymasterClient({ // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc'), // [!code focus]
}) // [!code focus]

const bundlerClient = createBundlerClient({
  chain: sepolia,
  paymaster: paymasterClient, // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc'),
})
```

:::info
The Paymaster URL above is a public endpoint **for testnets only**. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Paymaster](https://www.pimlico.io) or another Paymaster service.
:::

:::tip
You can see an example of end-to-end Paymaster Client usage on the [Sending User Operations guide](/account-abstraction/guides/sending-user-operations#7-optional-sponsor-user-operation).
:::

## Parameters

### key (optional)

- **Type:** `string`
- **Default:** `"paymaster"`

A key for the Client.

```ts twoslash
import { createPaymasterClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createPaymasterClient({
  key: 'foo', // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc')
})
```

### name (optional)

- **Type:** `string`
- **Default:** `"Paymaster Client"`

A name for the Client.

```ts twoslash
import { createPaymasterClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createPaymasterClient({
  name: 'Foo Bundler Client', // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc')
})
```

### pollingInterval (optional)

- **Type:** `number`
- **Default:** `4_000`

Frequency (in ms) for polling enabled Actions.

```ts twoslash
import { createPaymasterClient } from 'viem/account-abstraction'
import { http } from 'viem'
// ---cut---
const client = createPaymasterClient({
  pollingInterval: 10_000, // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc')
})
```

### rpcSchema (optional)

- **Type:** `RpcSchema`
- **Default:** `PaymasterRpcSchema`

Typed JSON-RPC schema for the client.

```ts twoslash
import { createPaymasterClient } from 'viem/account-abstraction'
import { http } from 'viem'
// @noErrors
// ---cut---
import { rpcSchema } from 'viem'

type CustomRpcSchema = [{ // [!code focus]
  Method: 'eth_wagmi', // [!code focus]
  Parameters: [string] // [!code focus]
  ReturnType: string // [!code focus]
}] // [!code focus]

const client = createPaymasterClient({
  rpcSchema: rpcSchema<CustomRpcSchema>(), // [!code focus]
  transport: http('https://public.pimlico.io/v2/11155111/rpc')
})

const result = await client.request({ // [!code focus]
  method: 'eth_wa // [!code focus] 
//               ^|

  params: ['hello'], // [!code focus]
}) // [!code focus]
```

### transport

- **Type:** `Transport`

The Transport of the Paymaster Client.

```ts twoslash
import { createPaymasterClient } from 'viem/account-abstraction'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const paymasterClient = createPaymasterClient({
  transport: http('https://public.pimlico.io/v2/11155111/rpc'), // [!code focus]
})
```