# signUserOperation (Smart Account)

Signs a User Operation with the Smart Account's **Owner**.

## Usage

:::code-group

```ts twoslash [example.ts]
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})

const signature = await account.signUserOperation({ // [!code focus:99]
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

```ts twoslash [config.ts] filename="config.ts"
import { createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const owner = privateKeyToAccount('0x...')
```

:::

## Returns

`Hex`

The User Operation signature.

## Parameters

### callData

- **Type:** `Hex`

The data to pass to the `sender` during the main execution call.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef', // [!code focus]
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### callGasLimit

- **Type:** `bigint`

The amount of gas to allocate the main execution call.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n, // [!code focus]
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### factory

- **Type:** `Address`

Account factory. Only for new accounts.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e', // [!code focus]
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### factoryData

- **Type:** `Hex`

Data for account factory.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000', // [!code focus]
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### maxFeePerGas

- **Type:** `bigint`

Maximum fee per gas.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n, // [!code focus]
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### maxPriorityFeePerGas

- **Type:** `bigint`

Maximum priority fee per gas.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  // [!code focus]
  nonce: 0n,
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### nonce

- **Type:** `bigint`

Anti-replay parameter.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n, // [!code focus]
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### paymaster

- **Type:** `Address`

Address of paymaster contract.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f', // [!code focus]
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### paymasterData

- **Type:** `Hex`

Data for paymaster.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  paymasterData: '0xdeadbeef', // [!code focus]
  paymasterPostOpGasLimit: 0n,
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### paymasterPostOpGasLimit

- **Type:** `bigint`

The amount of gas to allocate for the paymaster post-operation code.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n, // [!code focus]
  paymasterVerificationGasLimit: 0n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### paymasterVerificationGasLimit

- **Type:** `bigint`

The amount of gas to allocate for the paymaster validation code.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n,
  paymasterVerificationGasLimit: 69420n, // [!code focus]
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### preVerificationGas

- **Type:** `bigint`

Extra gas to pay the bunder.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n,
  paymasterVerificationGasLimit: 69420n,
  preVerificationGas: 53438n, // [!code focus]
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n,
})
```

### sender

- **Type:** `Address`

The account making the operation.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n,
  paymasterVerificationGasLimit: 69420n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f', // [!code focus]
  verificationGasLimit: 259350n,
})
```

### verificationGasLimit

- **Type:** `bigint`

The amount of gas to allocate for the verification step.

```ts twoslash
import { toSmartAccount, solady } from 'viem/account-abstraction'
import { client, owner } from './config'

export const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
// ---cut---
const signature = await account.signUserOperation({
  callData: '0xdeadbeef',
  callGasLimit: 141653n,
  factory: '0xfb6dab6200b8958c2655c3747708f82243d3f32e',
  factoryData: '0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
  maxFeePerGas: 15000000000n,
  maxPriorityFeePerGas: 2000000000n,
  nonce: 0n,
  paymaster: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: 69420n,
  paymasterVerificationGasLimit: 69420n,
  preVerificationGas: 53438n,
  sender: '0xE911628bF8428C23f179a07b081325cAe376DE1f',
  verificationGasLimit: 259350n, // [!code focus]
})
```