---
description: Estimates the gas values for a User Operation to be executed successfully.
---

# estimateUserOperationGas

Estimates the gas values for a User Operation to be executed successfully.

## Usage

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const gas = await bundlerClient.estimateUserOperationGas({ // [!code focus:7]
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }]
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { createBundlerClient, toCoinbaseSmartAccount } from 'viem/account-abstraction'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const account = await toCoinbaseSmartAccount({
  client,
  owners: [privateKeyToAccount('0x...')],
})

export const bundlerClient = createBundlerClient({
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

:::

:::info
The Bundler URL above is a public endpoint. Please do not use it in production as you will likely be rate-limited. Consider using [Pimlico's Bundler](https://www.pimlico.io), [Biconomy's Bundler](https://www.biconomy.io), or another Bundler service.
:::

### Account Hoisting

If you do not wish to pass an `account` to every `estimateUserOperationGas`, you can also hoist the Account on the Bundler Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { bundlerClient } from './config'

const gas = await bundlerClient.estimateUserOperationGas({ // [!code focus:7]
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }]
})
```

```ts twoslash [config.ts]
import { createPublicClient, http } from 'viem'
import { createBundlerClient, toSmartAccount, solady } from 'viem/account-abstraction'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const account = await toCoinbaseSmartAccount({
  client,
  owners: [privateKeyToAccount('0x...')],
})

export const bundlerClient = createBundlerClient({
  account, // [!code ++]
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

:::

### Contract Calls

The `calls` property also accepts **Contract Calls**, and can be used via the `abi`, `functionName`, and `args` properties.

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { bundlerClient, publicClient } from './config'
import { wagmiAbi } from './abi' // [!code focus]

const gas = await bundlerClient.estimateUserOperationGas({ // [!code focus:7]
  calls: [{
    abi: wagmiAbi,
    functionName: 'mint',
    to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  }],
})
```

```ts twoslash [abi.ts] filename="abi.ts"
export const wagmiAbi = [
  // ...
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ...
] as const;
```

```ts twoslash [config.ts]
import { createPublicClient, http } from 'viem'
import { createBundlerClient, toSmartAccount, solady } from 'viem/account-abstraction'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const account = await toCoinbaseSmartAccount({
  client,
  owners: [privateKeyToAccount('0x...')],
})

export const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http('https://public.pimlico.io/v2/1/rpc')
})
```

:::

## Returns

```ts
{
  callGasLimit: bigint;
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  paymasterVerificationGasLimit: bigint | undefined;
  paymasterPostOpGasLimit: bigint | undefined;
}
```

The estimated gas values.

## Parameters

### account

- **Type:** `SmartAccount`

The Account to use for User Operation execution.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account, // [!code focus]
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }]
})
```

### calls

- **Type:** `{ data: Hex, to: Address, value: bigint }[]`

The calls to execute in the User Operation.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{ // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
    value: parseEther('1') // [!code focus]
  }] // [!code focus]
})
```

:::tip
You can also pass raw call data via the `callData` property:

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  callData: '0xdeadbeef', // [!code focus]
})
```
:::

### callGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate the main execution call.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  callGasLimit: 69420n, // [!code focus]
})
```

### factory (optional)

- **Type:** `Address`

Account Factory address. 

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  factory: '0x1234567890123456789012345678901234567890', // [!code focus]
  factoryData: '0xdeadbeef',
})
```

### factoryData (optional)

- **Type:** `Hex`

Call data to execute on the Account Factory to deploy a Smart Account.

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  factory: '0x1234567890123456789012345678901234567890',
  factoryData: '0xdeadbeef', // [!code focus]
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Maximum fee per gas for User Operation execution.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  maxFeePerGas: 420n, // [!code focus]
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Maximum priority fee per gas for User Operation execution.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  maxPriorityFeePerGas: 420n, 
  maxFeePerGas: 10n, // [!code focus]
})
```

### nonce (optional)

- **Type:** `bigint`

Nonce for the User Operation.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  nonce: 10n, // [!code focus]
})
```

### paymaster (optional)

- **Type:** `Address | true | PaymasterClient | PaymasterActions`

Sets Paymaster configuration for the User Operation.

- If `paymaster: Address`, it will use the provided Paymaster contract address for sponsorship.
- If `paymaster: PaymasterClient`, it will use the provided [Paymaster Client](/account-abstraction/clients/paymaster) for sponsorship.
- If `paymaster: true`, it will be assumed that the Bundler Client also supports Paymaster RPC methods (e.g. `pm_getPaymasterData`), and use them for sponsorship.
- If [custom functions](/account-abstraction/clients/bundler#paymastergetpaymasterdata-optional) are provided to `paymaster`, it will use them for sponsorship.

#### Using a Paymaster Contract Address

```ts twoslash
import { account, bundlerClient } from './config'
// ---cut---
const hash = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB', // [!code focus]
  paymasterData: '0xdeadbeef',
})
```

#### Using a Paymaster Client

```ts twoslash
import { account, bundlerClient } from './config'
// ---cut---
import { http, parseEther } from 'viem'
import { createPaymasterClient } from 'viem/account-abstraction'

const paymasterClient = createPaymasterClient({ // [!code focus]
  transport: http('https://api.pimlico.io/v2/1/rpc?apikey={API_KEY}') // [!code focus]
}) // [!code focus]

const hash = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: paymasterClient, // [!code focus]
})
```

#### Using the Bundler Client as Paymaster

```ts twoslash
import { account, bundlerClient } from './config'
// ---cut---
const hash = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: true, // [!code focus]
})
```

### paymasterContext (optional)

- **Type:** `unknown`

Paymaster specific fields.

:::warning
This property is only available if **`paymaster` is a Paymaster Client**.
:::

```ts twoslash
import { account, bundlerClient } from './config'
// ---cut---
import { http, parseEther } from 'viem'
import { createPaymasterClient } from 'viem/account-abstraction'

const paymasterClient = createPaymasterClient({
  transport: http('https://public.pimlico.io/v2/11155111/rpc')
})

const hash = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: paymasterClient,
  paymasterContext: { // [!code focus]
    policyId: 'abc123' // [!code focus]
  }, // [!code focus]
})
```

### paymasterData (optional)

- **Type:** `Address`

Call data to execute on the Paymaster contract.

:::warning
This property is only available if **`paymaster` is an address**.
:::

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef', // [!code focus]
})
```

### paymasterPostOpGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the Paymaster post-operation code.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n, // [!code focus]
})
```

### paymasterVerificationGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the Paymaster validation code.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef',
  paymasterVerificationGasLimit: 69420n, // [!code focus]
})
```

### preVerificationGas (optional)

- **Type:** `bigint`

Extra gas to pay the Bundler.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  preVerificationGas: 69420n, // [!code focus]
})
```

### signature (optional)

- **Type:** `Hex`

Signature for the User Operation.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  signature: '0x...', // [!code focus]
})
```

### stateOverride (optional)

- **Type:** [`StateOverride`](/docs/glossary/types#stateoverride)

The state override set is an optional address-to-state mapping, where each entry specifies some state to be ephemerally overridden prior to executing the call.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  stateOverride: [ // [!code focus]
    { // [!code focus]
      address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
      balance: parseEther('1'), // [!code focus]
      stateDiff: [ // [!code focus]
        { // [!code focus]
          slot: '0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0', // [!code focus]
          value: '0x00000000000000000000000000000000000000000000000000000000000001a4', // [!code focus]
        }, // [!code focus]
      ], // [!code focus]
    } // [!code focus]
  ], // [!code focus]
})
```

### verificationGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the verification step.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const gas = await bundlerClient.estimateUserOperationGas({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  verificationGasLimit: 69420n, // [!code focus]
})
```