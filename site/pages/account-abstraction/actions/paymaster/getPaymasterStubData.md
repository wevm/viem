---
description: Retrieves paymaster-related properties to be used for the User Operation.
---

# getPaymasterStubData

Retrieves paymaster-related User Operation properties to be used for User Operation gas estimation.

Internally uses [ERC-7677's `pm_getPaymasterStubData` method](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7677.md#pm_getpaymasterstubdata).

## Usage

:::code-group

```ts twoslash [example.ts]
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

```ts twoslash [config.ts] filename="config.ts"
import { http } from 'viem'
import { createPaymasterClient } from 'viem/account-abstraction'

export const paymasterClient = createPaymasterClient({ 
  transport: http('https://api.pimlico.io/v2/1/rpc?apikey=<key>'), 
}) 
```

:::

## Returns

```
{
  isFinal: boolean
  paymaster: Address
  paymasterData: Hex
  paymasterVerificationGasLimit: bigint
  paymasterPostOpGasLimit: bigint
  sponsor: { name: string; icon: string }
}
```

Paymasted-related User Operation properties.

## Parameters

### callData

- **Type:** `Hex`

The data to pass to the `sender` during the main execution call.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000', // [!code focus]
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### callGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate the main execution call.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n, // [!code focus]
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### chainId

- **Type:** `number`

Chain ID to target.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  chainId: 1, // [!code focus]
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### context (optional)

- **Type:** `unknown`

Paymaster specific fields.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  context: { // [!code focus]
    policyId: 'abc123', // [!code focus]
  }, // [!code focus]
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### entryPointAddress

- **Type:** `Address`

EntryPoint address to target.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  chainId: 1, 
  entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', // [!code focus]
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### factory (optional)

- **Type:** `Address`

Account Factory address. 

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e', // [!code focus]
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### factoryData (optional)

- **Type:** `Hex`

Call data to execute on the Account Factory to deploy a Smart Account.

:::warning
This property should only be populated when the Smart Account has not been deployed yet.
:::

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000', // [!code focus]
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### maxFeePerGas (optional)

- **Type:** `bigint`

Maximum fee per gas for User Operation execution.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n, // [!code focus]
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### maxPriorityFeePerGas (optional)

- **Type:** `bigint`

Maximum priority fee per gas for User Operation execution.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n, // [!code focus]
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### nonce 

- **Type:** `bigint`

Nonce for the User Operation.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n, // [!code focus]
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### preVerificationGas (optional)

- **Type:** `bigint`

Extra gas to pay the Bunder.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  preVerificationGas: 69420n, // [!code focus]
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### sender 

- **Type:** `Address`

Sender for the User Operation.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  preVerificationGas: 69420n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f', // [!code focus]
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
})
```

### signature 

- **Type:** `Hex`

Signature for the User Operation.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  preVerificationGas: 69420n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' // [!code focus]
})
```

### verificationGasLimit (optional)

- **Type:** `bigint`

The amount of gas to allocate for the verification step.

```ts twoslash
import { paymasterClient } from './config'

const paymasterArgs = await paymasterClient.getPaymasterStubData({
  callData: '0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
  callGasLimit: 69420n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 14510554812n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  signature: '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
  verificationGasLimit: 69420n, // [!code focus]
})
```