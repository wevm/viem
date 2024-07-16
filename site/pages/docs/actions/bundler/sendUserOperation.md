---
description: Broadcasts a User Operation to the Bundler.
---

# sendUserOperation

Broadcasts a User Operation to the Bundler.

## Usage

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({ // [!code focus:7]
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createBundlerClient, createPublicClient, http } from 'viem'
import { toSmartAccount, privateKeyToAccount, solady } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner: privateKeyToAccount('0x...'),
  }),
})

export const bundlerClient = createBundlerClient({
  chain: mainnet,
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

:::

### Account Hoisting

If you do not wish to pass an `account` to every `sendUserOperation`, you can also hoist the Account on the Bundler Client (see `config.ts`).

[Learn more](/docs/clients/wallet#account).

:::code-group

```ts twoslash [example.ts]
import { parseEther } from 'viem'
import { bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({ // [!code focus:7]
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createBundlerClient, createPublicClient, http } from 'viem'
import { toSmartAccount, privateKeyToAccount, solady } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner: privateKeyToAccount('0x...'),
  }),
})

export const bundlerClient = createBundlerClient({
  account, // [!code ++]
  client,
  chain: mainnet,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
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

const hash = await bundlerClient.sendUserOperation({ // [!code focus:7]
  calls: [{
    abi: wagmiAbi,
    functionName: 'mint',
    to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  }],
})
```

```ts [abi.ts] filename="abi.ts"
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

```ts twoslash [config.ts] filename="config.ts"
import { createBundlerClient, createPublicClient, http } from 'viem'
import { toSmartAccount, privateKeyToAccount, solady } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner: privateKeyToAccount('0x...'),
  }),
})

export const bundlerClient = createBundlerClient({
  account,
  chain: mainnet,
  client,
  transport: http('https://public.stackup.sh/api/v1/node/ethereum-mainnet')
})
```

:::

## Returns

`Hash`

The User Operation hash.

## Parameters

### account

- **Type:** `SmartAccount`

The Account to use for User Operation execution.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account, // [!code focus]
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }]
})
```

### calls

- **Type:** `({ data?: Hex | undefined, to: Address, value?: bigint | undefined } | { abi: Abi, functionName: string, args: unknown[], to: Address, value?: bigint | undefined })[]`

The calls to execute in the User Operation.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{ // [!code focus]
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', // [!code focus]
    value: parseEther('1') // [!code focus]
  }, { // [!code focus]
    abi: wagmiAbi, // [!code focus]
    functionName: 'mint', // [!code focus]
    to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code focus]
  }] // [!code focus]
})
```

:::tip
You can also pass raw call data via the `callData` property:

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'
// ---cut---
const hash = await bundlerClient.sendUserOperation({
  account,
  callData: '0xdeadbeef', // [!code focus]
})
```
:::

### callGasLimit

- **Type:** `bigint`

The amount of gas to allocate the main execution call.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  callGasLimit: 69420n, // [!code focus]
})
```

### factory

- **Type:** `Address`

Account Factory address. 

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  factory: '0x1234567890123456789012345678901234567890', // [!code focus]
  factoryData: '0xdeadbeef',
})
```

### factoryData

- **Type:** `Hex`

Call data to execute on the Account Factory to deploy a Smart Account.

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  factory: '0x1234567890123456789012345678901234567890',
  factoryData: '0xdeadbeef', // [!code focus]
})
```

### maxFeePerGas

- **Type:** `bigint`

Maximum fee per gas for User Operation execution.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  maxFeePerGas: 420n, // [!code focus]
})
```

### maxPriorityFeePerGas

- **Type:** `bigint`

Maximum priority fee per gas for User Operation execution.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  maxPriorityFeePerGas: 420n, 
  maxFeePerGas: 10n, // [!code focus]
})
```

### nonce

- **Type:** `bigint`

Nonce for the User Operation.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  nonce: 10n, // [!code focus]
})
```

### paymaster

- **Type:** `Address`

Paymaster address.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB', // [!code focus]
  paymasterData: '0xdeadbeef',
})
```

### paymasterData

- **Type:** `Address`

Call data to execute on the Paymaster contract.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  paymaster: '0x942fD5017c0F60575930D8574Eaca13BEcD6e1bB',
  paymasterData: '0xdeadbeef', // [!code focus]
})
```

### paymasterPostOpGasLimit

- **Type:** `bigint`

The amount of gas to allocate for the Paymaster post-operation code.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
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

### paymasterVerificationGasLimit

- **Type:** `bigint`

The amount of gas to allocate for the Paymaster validation code.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
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

### preVerificationGas

- **Type:** `bigint`

Extra gas to pay the Bunder.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  preVerificationGas: 69420n, // [!code focus]
})
```

### signature

- **Type:** `Hex`

Signature for the User Operation.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  signature: '0x...', // [!code focus]
})
```

### verificationGasLimit

- **Type:** `bigint`

The amount of gas to allocate for the verification step.

```ts twoslash
import { parseEther } from 'viem'
import { account, bundlerClient } from './config'

const hash = await bundlerClient.sendUserOperation({
  account,
  calls: [{
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: parseEther('1')
  }],
  verificationGasLimit: 69420n, // [!code focus]
})
```