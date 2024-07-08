---
description: Creates a Smart Account with a provided Account Implementation.
---

# toSmartAccount

Creates a Smart Account with a provided Account [Implementation](/docs/accounts/implementations) and [Client](/docs/clients/public).

## Import

```ts twoslash
import { toSmartAccount, solady } from 'viem/accounts'
```

## Usage

To instantiate a Smart Account, you will need to provide an Account [Implementation](/docs/accounts/implementations) as well as a [Client](/docs/clients/public). 

For the example below, we will use the [`solady` Implementation](/docs/accounts/implementations/solady) – a basic implementation which utilizes [Solady's `ERC4337.sol`](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC4337.sol).

:::code-group

```ts twoslash [example.ts]
import { toSmartAccount, solady } from 'viem/accounts'
import { client, owner } from './config.js'

const account = await toSmartAccount({
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
```

```ts twoslash [config.ts] filename="config.ts"
import { http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

export const owner = privateKeyToAccount('0x...')
 
export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})
```

:::

## Returns

`SmartAccount`

The Smart Account.

## Parameters

### address

- **Type:** `Address`

Address of the Smart Account.

```ts twoslash
import { toSmartAccount, solady } from 'viem/accounts'
import { client, owner } from './config.js'
// ---cut---
const account = await toSmartAccount({
  address: '0x0000000000000000000000000000000000000000', // [!code focus]
  client,
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
```

### client

- **Type:** `Client`

Client used to retrieve Smart Account data, and perform signing (if owner is a [JSON-RPC Account](/docs/accounts/jsonRpc)).

```ts twoslash
import { toSmartAccount, solady } from 'viem/accounts'
import { owner } from './config.js'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
// ---cut---
const client = createPublicClient({ // [!code focus]
  chain: mainnet, // [!code focus]
  transport: http(), // [!code focus]
}) // [!code focus]

const account = await toSmartAccount({
  address: '0x0000000000000000000000000000000000000000',
  client, // [!code focus]
  implementation: solady({
    factoryAddress: '0x...',
    owner,
  }),
})
```

### implementation

- **Type:** `SmartAccountImplementation`

Implementation of the Smart Account.

```ts twoslash
import { toSmartAccount, solady } from 'viem/accounts'
import { client, owner } from './config.js'
// ---cut---
const account = await toSmartAccount({
  address: '0x0000000000000000000000000000000000000000',
  client,
  implementation: solady({ // [!code focus]
    factoryAddress: '0x...', // [!code focus]
    owner, // [!code focus]
  }), // [!code focus]
})
```